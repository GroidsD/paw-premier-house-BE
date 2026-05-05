const detectAnswerMode = require("./answerModeDetector");
const productSearchService = require("./search/productSearchService");
const serviceRepo = require("./repositories/serviceChatRepository");
const bookingRepo = require("./repositories/bookingChatRepository");
const recommendationRepo = require("./repositories/recommendationChatRepository");
const orderRepo = require("./repositories/orderChatRepository");
const productKnowledgeRepo = require("./repositories/productKnowledgeRepository");
const externalSearchService = require("./search/externalSearchService");
const normalizeText = require("../../utils/normalizeText");

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

const normalizeTerm = (value = "") => normalizeText(String(value || ""));

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

// const shouldUseSessionProductContext = (analysis = {}) =>
//     Boolean(analysis?.contextualReference);
const shouldUseSessionProductContext = (analysis = {}, message = "") => {
    const text = normalizeTerm(message);

    const hasKnowledgeSignal =
        text.includes("thanh phan") ||
        text.includes("ingredient") ||
        text.includes("ingredients") ||
        text.includes("cong dung") ||
        text.includes("tac dung") ||
        text.includes("benefit") ||
        text.includes("benefits") ||
        text.includes("cach dung") ||
        text.includes("su dung") ||
        text.includes("huong dan") ||
        text.includes("usage") ||
        text.includes("luu y") ||
        text.includes("canh bao") ||
        text.includes("warning") ||
        text.includes("an toan") ||
        text.includes("safe") ||
        text.includes("phu hop") ||
        text.includes("dung cho");

    return Boolean(analysis?.contextualReference || hasKnowledgeSignal);
};
const shouldResolveExplicitProductContext = (analysis = {}) =>
    Boolean(analysis?.explicitProductName);

const shouldUseSessionServiceContext = (analysis = {}) =>
    Boolean(analysis?.contextualReference);

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
        answerModeResult?.mode || context?.answer_mode || "general_fallback",
    answer_mode_reason:
        answerModeResult?.reason || context?.answer_mode_reason || null,
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
    failure_reason: "auth_required",
});

const buildGeneralContext = ({
    message,
    reply,
    confidence = 0.2,
    failure_reason = "general_fallback",
}) => ({
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
    failure_reason,
    ...(reply ? { reply } : {}),
});

const buildClarifyContext = ({
    message,
    reply = "Bạn cho mình tên sản phẩm hoặc dịch vụ cụ thể nhé.",
    failure_reason = "needs_clarification",
}) => ({
    type: "general",
    items: [],
    faq: [],
    note: "Clarification required before grounding answer.",
    reply,
    suggestions: [
        "Tên sản phẩm cụ thể",
        "Sản phẩm cho chó",
        "Sản phẩm cho mèo",
    ],
    user_question: message,
    confidence: 0.2,
    failure_reason,
});

const buildAmbiguousReferenceContext = ({ message, kind = "product" }) => ({
    type: "knowledge",
    items: [],
    knowledge_items: [],
    note: "Ambiguous contextual reference without enough product/service context.",
    reply:
        kind === "product"
            ? "Mình chưa biết chính xác bạn đang hỏi sản phẩm nào. Bạn cho mình tên sản phẩm cụ thể nhé."
            : "Mình chưa biết chính xác bạn đang hỏi dịch vụ nào. Bạn nói rõ tên dịch vụ giúp mình nhé.",
    confidence: 0.2,
    failure_reason: "ambiguous_reference_no_context",
    answer_source: "internal_knowledge",
    user_question: message,
});

const getResolvedProductContext = ({ currentUser = {}, analysis = {} }) => {
    const productId =
        currentUser?.currentProductId || currentUser?.lastProductId || null;

    const productName =
        currentUser?.currentProductName || currentUser?.lastProductName || null;

    return {
        productId,
        productName,
        hasBinding: Boolean(productId || analysis?.explicitProductName),
    };
};

const getResolvedServiceContext = ({ currentUser = {}, analysis = {} }) => {
    const serviceId =
        currentUser?.currentServiceId || currentUser?.lastServiceId || null;

    const serviceName =
        currentUser?.currentServiceName || currentUser?.lastServiceName || null;

    return {
        serviceId,
        serviceName,
        hasBinding: Boolean(serviceId),
    };
};

const buildDbStrictContext = async ({
    intent,
    message,
    currentUser,
    analysis,
}) => {
    switch (intent) {
        case "product_search":
            if (
                analysis?.needsDisambiguation &&
                analysis?.semanticIsAmbiguous &&
                analysis?.semanticGroupedMatches
            ) {
                return buildDisambiguationContext({
                    message,
                    analysis,
                });
            }

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
const detectRequestedKnowledgeType = (message = "") => {
    const text = normalizeTerm(message);

    if (
        text.includes("thanh phan") ||
        text.includes("ingredient") ||
        text.includes("ingredients")
    ) {
        return "ingredient";
    }

    if (
        text.includes("cach dung") ||
        text.includes("su dung") ||
        text.includes("huong dan") ||
        text.includes("how to use") ||
        text.includes("usage")
    ) {
        return "usage";
    }

    if (
        text.includes("cong dung") ||
        text.includes("tac dung") ||
        text.includes("benefit") ||
        text.includes("benefits") ||
        text.includes("tot khong")
    ) {
        return "benefit";
    }

    if (
        text.includes("phu hop") ||
        text.includes("dung cho") ||
        text.includes("suitable for")
    ) {
        return "suitable_for";
    }

    if (
        text.includes("luu y") ||
        text.includes("canh bao") ||
        text.includes("warning") ||
        text.includes("safe") ||
        text.includes("an toan")
    ) {
        return "warning";
    }

    return null;
};
const filterKnowledgeItemsByRequestedType = ({
    knowledgeItems = [],
    requestedType = null,
}) => {
    if (!requestedType) return knowledgeItems;

    const matched = knowledgeItems.filter(
        (item) =>
            normalizeTerm(item?.knowledge_type) ===
            normalizeTerm(requestedType),
    );

    return matched.length > 0 ? matched : knowledgeItems;
};
const buildDisambiguationContext = ({ message, analysis }) => {
    const grouped = analysis?.semanticGroupedMatches || {};
    const hasMilkFood =
        Array.isArray(grouped.milk_food) && grouped.milk_food.length > 0;
    const hasHygiene =
        Array.isArray(grouped.hygiene_care) && grouped.hygiene_care.length > 0;
    const hasRelatedFood =
        Array.isArray(grouped.related_food) && grouped.related_food.length > 0;

    let reply =
        "Mình thấy có vài nhóm sản phẩm liên quan. Bạn muốn xem nhóm nào trước?";

    if (hasMilkFood && hasHygiene) {
        reply =
            "Mình thấy có 2 nhóm liên quan: sữa dinh dưỡng và sữa tắm. Bạn muốn xem nhóm nào trước?";
    } else if (hasMilkFood) {
        reply =
            "Mình thấy nhóm sữa dinh dưỡng phù hợp. Bạn muốn xem thử không?";
    } else if (hasHygiene) {
        reply =
            "Mình thấy nhóm sữa tắm và vệ sinh phù hợp. Bạn muốn xem thử không?";
    } else if (hasRelatedFood) {
        reply =
            "Mình thấy một vài nhóm thức ăn liên quan. Bạn muốn xem nhóm nào trước?";
    }

    return {
        type: "disambiguation",
        items: [],
        grouped_matches: grouped,
        reply,
        confidence: analysis?.semanticConfidence || 0.6,
        failure_reason: "needs_disambiguation",
        answer_source: "semantic_grouped",
        user_question: message,
    };
};
const buildInternalKnowledgeContext = async ({
    intent,
    message,
    currentUser,
    analysis,
}) => {
    const resolvedProduct = getResolvedProductContext({
        currentUser,
        analysis,
    });

    const resolvedService = getResolvedServiceContext({
        currentUser,
        analysis,
    });

    const asksContextual = Boolean(analysis?.contextualReference);
    // const shouldUseSessionProduct = shouldUseSessionProductContext(analysis);
    const shouldUseSessionProduct = shouldUseSessionProductContext(
        analysis,
        message,
    );
    const shouldResolveExplicitProduct =
        shouldResolveExplicitProductContext(analysis);
    const shouldUseSessionService = shouldUseSessionServiceContext(analysis);

    if (
        asksContextual &&
        !resolvedProduct.hasBinding &&
        !resolvedService.hasBinding
    ) {
        return buildAmbiguousReferenceContext({
            message,
            kind: "product",
        });
    }

    if (
        hasConcreteProductEntity(analysis) &&
        !resolvedProduct.hasBinding &&
        !shouldResolveExplicitProduct &&
        !shouldUseSessionProduct
    ) {
        return buildClarifyContext({
            message,
            reply: "Bạn cho mình tên sản phẩm cụ thể để mình kiểm tra thành phần, công dụng hoặc cách dùng nhé.",
            failure_reason: "product_not_resolved_for_internal_knowledge",
        });
    }

    if (
        hasConcreteServiceEntity(analysis) &&
        !resolvedService.hasBinding &&
        !shouldUseSessionService &&
        !(intent === "service_search" || intent === "service_booking_intent")
    ) {
        return buildClarifyContext({
            message,
            reply: "Bạn cho mình tên dịch vụ cụ thể để mình hỗ trợ chính xác hơn nhé.",
            failure_reason: "service_not_resolved_for_internal_knowledge",
        });
    }

    // 1) Explicit product name phải ưu tiên search best match trước,
    // không dùng lastProductId cũ trong session.
    if (shouldResolveExplicitProduct) {
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
            const requestedKnowledgeType =
                detectRequestedKnowledgeType(message);

            const filteredKnowledgeItems = requestedKnowledgeType
                ? knowledgeItems.filter(
                      (k) =>
                          normalizeTerm(k.knowledge_type) ===
                          requestedKnowledgeType,
                  )
                : knowledgeItems;
            if (knowledgeItems.length > 0) {
                return {
                    ...productContext,
                    type: "knowledge",
                    items: [bestMatch],
                    knowledge_items: filteredKnowledgeItems,
                    requested_knowledge_type: requestedKnowledgeType,
                    note: "Resolved explicit product name to best match, then loaded filtered internal knowledge.",
                    reply: "",
                    confidence: Math.max(productContext?.confidence ?? 0, 0.78),
                    failure_reason: null,
                    answer_source: "internal_knowledge",
                };
            }

            return {
                ...productContext,
                type: "knowledge",
                items: [bestMatch],
                knowledge_items: [],
                note: "Explicit product matched, but no product knowledge records yet.",
                reply: "Mình đã xác định được sản phẩm liên quan trong shop, nhưng hiện chưa có kho kiến thức nội bộ để trả lời chính xác phần công dụng, thành phần hoặc cách dùng.",
                confidence: Math.min(productContext?.confidence ?? 0, 0.45),
                failure_reason: "no_internal_knowledge_records",
                answer_source: "internal_knowledge",
            };
        }

        return buildClarifyContext({
            message,
            reply: "Mình chưa xác định được đúng sản phẩm bạn đang hỏi. Bạn gửi lại tên sản phẩm cụ thể giúp mình nhé.",
            failure_reason: "explicit_product_not_matched",
        });
    }

    // 2) Contextual follow-up mới dùng session product hiện tại/cũ
    if (shouldUseSessionProduct && resolvedProduct.productId) {
        const knowledgeItems =
            await productKnowledgeRepo.findKnowledgeByProductId({
                productId: resolvedProduct.productId,
                language: analysis?.language || null,
            });

        const requestedKnowledgeType = detectRequestedKnowledgeType(message);

        const filteredKnowledgeItems = filterKnowledgeItemsByRequestedType({
            knowledgeItems,
            requestedType: requestedKnowledgeType,
        });

        if (knowledgeItems.length > 0) {
            return {
                type: "knowledge",
                items: [
                    {
                        product_id: resolvedProduct.productId,
                        name: resolvedProduct.productName || null,
                    },
                ],
                knowledge_items: filteredKnowledgeItems,
                requested_knowledge_type: requestedKnowledgeType,
                note: "Bound by currentProductId/lastProductId from chat context.",
                reply: "",
                confidence: 1,
                failure_reason: null,
                answer_source: "internal_knowledge",
            };
        }

        return {
            type: "knowledge",
            items: [
                {
                    product_id: resolvedProduct.productId,
                    name: resolvedProduct.productName || null,
                },
            ],
            knowledge_items: [],
            note: "Bound product exists, but no knowledge records yet.",
            reply: "Mình đã xác định được sản phẩm bạn đang hỏi, nhưng hiện chưa có dữ liệu kiến thức nội bộ phù hợp để trả lời chi tiết.",
            confidence: 0.45,
            failure_reason: "no_internal_knowledge_records",
            answer_source: "internal_knowledge",
        };
    }

    // 3) Service follow-up chỉ dùng session service khi là contextual query
    if (shouldUseSessionService && resolvedService.serviceId) {
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
                note: "Contextual service matched, but service knowledge repository is not connected yet.",
                reply: "Mình đã xác định được dịch vụ liên quan, nhưng hiện chưa có kho kiến thức nội bộ cho dịch vụ để trả lời chi tiết.",
                confidence: Math.min(serviceContext?.confidence ?? 0, 0.45),
                failure_reason: "no_internal_knowledge_records",
                answer_source: "internal_knowledge",
            };
        }
    }

    return buildClarifyContext({
        message,
        reply: "Mình chưa xác định được chính xác sản phẩm hoặc dịch vụ cụ thể trong shop. Bạn nói rõ tên giúp mình nhé.",
        failure_reason: "no_entity_match_for_internal_knowledge",
    });
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
            failure_reason: null,
            answer_source: "external_reference",
        };
    }

    return {
        type: "external_reference",
        items: relatedItems.slice(0, 2),
        external_sources: [],
        note: "External reference mode selected, but no outside sources were returned.",
        reply: "Câu hỏi này thuộc dạng kiến thức tham khảo ngoài hệ thống. Hiện chưa lấy được nguồn ngoài phù hợp để trả lời một cách đúng nhất.",
        confidence: 0.25,
        failure_reason: "no_external_sources",
        answer_source: "external_reference",
    };
};

const buildContext = async ({
    intent,
    message,
    currentUser,
    analysis,
    answerModeResult = null,
}) => {
    const resolvedAnswerMode =
        answerModeResult ||
        detectAnswerMode({
            intent,
            message,
            analysis,
            currentUser,
        });

    let context;

    switch (resolvedAnswerMode.mode) {
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
        resolvedAnswerMode,
    );
};
module.exports = buildContext;
