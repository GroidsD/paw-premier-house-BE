const detectAnswerMode = require("./answerModeDetector");
const productSearchService = require("./search/productSearchService");
const serviceRepo = require("./repositories/serviceChatRepository");
const bookingRepo = require("./repositories/bookingChatRepository");
const recommendationRepo = require("./repositories/recommendationChatRepository");
const orderRepo = require("./repositories/orderChatRepository");
const productKnowledgeRepo = require("./repositories/productKnowledgeRepository");
const externalSearchService = require("./search/externalSearchService");
const MIN_RELATED_ITEM_CONFIDENCE = 0.6;

const PRODUCT_ENTITY_TERMS = new Set([
    "pate",
    "kibble",
    "hat",
    "toy",
    "do choi",
    "snack",
    "shampoo",
    "sua tam",
    "thuc an",
    "do an",
    "milk",
    "sua",
]);

const SERVICE_ENTITY_TERMS = new Set([
    "service",
    "dich vu",
    "grooming",
    "spa",
    "hotel",
    "boarding",
    "training",
]);

const normalizeTerm = (value = "") =>
    String(value || "")
        .trim()
        .toLowerCase();

const hasAnyConcreteTerm = (terms = [], dictionary = new Set()) =>
    (Array.isArray(terms) ? terms : []).some((term) =>
        dictionary.has(normalizeTerm(term)),
    );

const hasConcreteProductEntity = (analysis = {}) =>
    Boolean(analysis?.productForm) ||
    hasAnyConcreteTerm(analysis?.searchTerms, PRODUCT_ENTITY_TERMS) ||
    hasAnyConcreteTerm(analysis?.categoryHints, PRODUCT_ENTITY_TERMS) ||
    hasAnyConcreteTerm(analysis?.rawKeywords, PRODUCT_ENTITY_TERMS);

const hasConcreteServiceEntity = (analysis = {}) =>
    hasAnyConcreteTerm(analysis?.searchTerms, SERVICE_ENTITY_TERMS) ||
    hasAnyConcreteTerm(analysis?.categoryHints, SERVICE_ENTITY_TERMS) ||
    hasAnyConcreteTerm(analysis?.rawKeywords, SERVICE_ENTITY_TERMS);

const attachAnalysis = (
    context,
    analysis,
    message,
    currentUser,
    answerModeResult,
) => ({
    ...(context || {}),
    analysis: context?.analysis || analysis || null,
    user_question: context?.user_question || message,
    matched_categories: context?.matched_categories || [],
    applied_filters: context?.applied_filters || [],
    confidence: context?.confidence ?? 0,
    answer_mode:
        context?.answer_mode || answerModeResult?.mode || "general_fallback",
    answer_mode_reason:
        context?.answer_mode_reason || answerModeResult?.reason || null,
    auth: {
        isLoggedIn: Boolean(currentUser?.user_id),
        user_id: currentUser?.user_id || null,
    },
});

const buildAuthRequiredContext = ({
    message,
    type = "auth_required",
    reply,
}) => ({
    type,
    items: [],
    reply:
        reply ||
        "Bạn cần đăng nhập để xem dữ liệu cá nhân như booking, đơn hàng hoặc gợi ý dành riêng cho mình.",
    suggestions: ["Sản phẩm cho chó", "Dịch vụ grooming"],
    user_question: message,
    confidence: 1,
    answer_mode: "db_strict",
    answer_mode_reason: "login required for personal data",
});

const buildGeneralContext = ({ message, reply, confidence = 0.2 }) => ({
    type: "general",
    items: [],
    faq: [],
    note: "No structured data matched. Respond generally.",
    suggestions: [
        "Sản phẩm cho chó",
        "Dịch vụ grooming",
        "Đăng nhập để xem booking",
    ],
    user_question: message,
    confidence,
    ...(reply ? { reply } : {}),
});

const buildDbStrictContext = async ({
    intent,
    message,
    currentUser,
    analysis,
}) => {
    switch (intent) {
        case "product_search":
            return productSearchService.findRelevantProducts({
                message,
                currentUser,
                analysis,
            });

        case "product_recommend":
            if (!currentUser?.user_id) {
                const guestContext =
                    await productSearchService.findRelevantProducts({
                        message,
                        currentUser,
                        analysis,
                    });

                return {
                    ...guestContext,
                    personalized: false,
                    note: "Guest mode recommendation fallback",
                };
            }

            return recommendationRepo.findUserRecommendations({
                currentUser,
                message,
                analysis,
            });

        case "service_search":
            return serviceRepo.findRelevantServices({
                message,
                currentUser,
                analysis,
            });

        case "service_booking_intent":
            if (!currentUser?.user_id) {
                return buildAuthRequiredContext({
                    message,
                    type: "auth_required",
                    reply: "Bạn cần đăng nhập để đặt lịch dịch vụ nhé.",
                });
            }

            return {
                ...(await serviceRepo.findRelevantServices({
                    message,
                    currentUser,
                    analysis,
                })),
                booking_ready: true,
            };

        case "my_bookings":
            if (!currentUser?.user_id) {
                return buildAuthRequiredContext({
                    message,
                    type: "auth_required",
                    reply: "Bạn cần đăng nhập để xem booking của mình nhé.",
                });
            }

            return bookingRepo.findUserBookings({
                currentUser,
                message,
            });

        case "my_orders":
            if (!currentUser?.user_id) {
                return buildAuthRequiredContext({
                    message,
                    type: "auth_required",
                    reply: "Bạn cần đăng nhập để xem đơn hàng của mình nhé.",
                });
            }

            return orderRepo.findUserOrders({
                currentUser,
                message,
            });

        default:
            return buildGeneralContext({ message });
    }
};

const buildInternalKnowledgeContext = async ({
    intent,
    message,
    currentUser,
    analysis,
}) => {
    const canUseProductEntity =
        (intent === "product_search" || intent === "product_recommend") &&
        hasConcreteProductEntity(analysis);

    const canUseServiceEntity =
        (intent === "service_search" || intent === "service_booking_intent") &&
        hasConcreteServiceEntity(analysis);

    if (canUseProductEntity) {
        const productContext = await productSearchService.findRelevantProducts({
            message,
            currentUser,
            analysis,
        });

        if (
            (productContext?.confidence ?? 0) >= MIN_RELATED_ITEM_CONFIDENCE &&
            (productContext?.items || []).length > 0
        ) {
            const bestMatch = productContext.items[0];

            const knowledgeItems =
                await productKnowledgeRepo.findKnowledgeByProductId({
                    productId: bestMatch.product_id,
                    language: analysis?.language || null,
                });

            if (knowledgeItems.length > 0) {
                return {
                    ...productContext,
                    type: "knowledge",
                    items: [bestMatch],
                    knowledge_items: knowledgeItems,
                    note: "Internal product knowledge loaded successfully.",
                    reply: "",
                    confidence: Math.max(productContext?.confidence ?? 0, 0.75),
                };
            }
            console.log(
                "knowledge best match:",
                productContext?.items?.map((item) => ({
                    id: item.product_id,
                    name: item.name,
                    category: item.category,
                })),
            );
            return {
                ...productContext,
                type: "knowledge",
                items: [bestMatch],
                knowledge_items: [],
                note: "Matched product found, but no product knowledge records yet.",
                reply: "Mình đã xác định được sản phẩm liên quan trong shop, nhưng hiện chưa có kho kiến thức nội bộ để trả lời chính xác phần công dụng hoặc cách dùng.",
                confidence: Math.min(productContext?.confidence ?? 0, 0.45),
            };
        }
    }

    if (canUseServiceEntity) {
        const serviceContext = await serviceRepo.findRelevantServices({
            message,
            currentUser,
            analysis,
        });

        if (
            (serviceContext?.confidence ?? 0) >= MIN_RELATED_ITEM_CONFIDENCE &&
            (serviceContext?.items || []).length > 0
        ) {
            return {
                ...serviceContext,
                type: "knowledge",
                knowledge_items: [],
                note: "Service matched, but service knowledge repository is not connected yet.",
                reply: "Mình đã xác định được dịch vụ liên quan, nhưng hiện chưa có kho kiến thức nội bộ cho dịch vụ để trả lời chi tiết.",
                confidence: Math.min(serviceContext?.confidence ?? 0, 0.45),
            };
        }
    }

    return {
        type: "knowledge",
        items: [],
        knowledge_items: [],
        note: "No strong concrete shop entity matched for internal knowledge mode.",
        reply: "Mình chưa xác định được chính xác sản phẩm hoặc dịch vụ cụ thể trong shop để trả lời phần công dụng hoặc cách dùng.",
        confidence: 0.2,
    };
};

const buildExternalReferenceContext = async ({
    intent,
    message,
    currentUser,
    analysis,
}) => {
    let relatedItems = [];

    const canUseProductEntity =
        (intent === "product_search" || intent === "product_recommend") &&
        hasConcreteProductEntity(analysis);

    const canUseServiceEntity =
        (intent === "service_search" || intent === "service_booking_intent") &&
        hasConcreteServiceEntity(analysis);

    try {
        if (canUseProductEntity) {
            const productContext =
                await productSearchService.findRelevantProducts({
                    message,
                    currentUser,
                    analysis,
                });

            if (
                (productContext?.confidence ?? 0) >=
                    MIN_RELATED_ITEM_CONFIDENCE &&
                (productContext?.items || []).length > 0
            ) {
                relatedItems = productContext.items || [];
            }
        } else if (canUseServiceEntity) {
            const serviceContext = await serviceRepo.findRelevantServices({
                message,
                currentUser,
                analysis,
            });

            if (
                (serviceContext?.confidence ?? 0) >=
                    MIN_RELATED_ITEM_CONFIDENCE &&
                (serviceContext?.items || []).length > 0
            ) {
                relatedItems = serviceContext.items || [];
            }
        }
    } catch (error) {
        relatedItems = [];
    }

    const externalSources = await externalSearchService.searchExternalKnowledge(
        {
            message,
            analysis,
            limit: 4,
        },
    );

    if (externalSources.length > 0) {
        return {
            type: "external_reference",
            items: relatedItems.slice(0, 2),
            external_sources: externalSources,
            note: "External reference sources loaded successfully.",
            reply: "",
            confidence: 0.75,
        };
    }

    return {
        type: "external_reference",
        items: relatedItems.slice(0, 2),
        external_sources: [],
        note: "External reference mode selected, but no outside sources were returned.",
        reply: "Câu hỏi này thuộc dạng kiến thức tham khảo ngoài hệ thống. Hiện chưa lấy được nguồn ngoài phù hợp để trả lời một cách đúng nhất.",
        confidence: 0.25,
    };
};

const buildContext = async ({ intent, message, currentUser, analysis }) => {
    const answerModeResult = detectAnswerMode({
        intent,
        message,
        analysis,
        currentUser,
    });

    let context;

    switch (answerModeResult.mode) {
        case "db_strict":
            context = await buildDbStrictContext({
                intent,
                message,
                currentUser,
                analysis,
            });
            break;

        case "internal_knowledge":
            context = await buildInternalKnowledgeContext({
                intent,
                message,
                currentUser,
                analysis,
            });

            // FALLBACK logic: Nếu kiến thức nội bộ quá yếu hoặc không có, thử search ngoài
            if (
                (context?.confidence ?? 0) < 0.5 &&
                (!context?.knowledge_items || context.knowledge_items.length === 0)
            ) {
                console.log("Internal knowledge is weak, falling back to external sources...");
                context = await buildExternalReferenceContext({
                    intent,
                    message,
                    currentUser,
                    analysis,
                });
            }
            break;

        case "external_reference":
            context = await buildExternalReferenceContext({
                intent,
                message,
                currentUser,
                analysis,
            });
            break;

        default:
            context = buildGeneralContext({ message });
            break;
    }

    return attachAnalysis(
        context,
        analysis,
        message,
        currentUser,
        answerModeResult,
    );
};

module.exports = buildContext;
