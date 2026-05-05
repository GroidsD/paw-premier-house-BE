const {
    pickLanguage,
    getFallbackReply,
    getActionLabel,
    truncateText,
    calcDiscountPercent,
    getStockStatus,
    sanitizeReplyText,
    stripExternalLinks,
    getLowConfidenceReply,
    extractBudget,
    getFormLabel,
} = require("./utilsFormatter");
const {
    buildProductReply,
    buildServiceReply,
    buildBookingReply,
    buildOrderReply,
} = require("./replyBuilders");
const { getSuggestionsByContext } = require("./suggestionBuilder");

const buildExternalFallbackReply = ({
    externalSources = [],
    language = "vi",
}) => {
    const firstSource = externalSources[0] || null;
    const snippet = String(firstSource?.snippet || "").trim();

    if (snippet) {
        return snippet.length > 220
            ? `${snippet.slice(0, 220).trim()}...`
            : snippet;
    }

    return language === "en"
        ? "I found outside references for this question, but I could not generate a grounded summary right now."
        : "Mình đã tìm thấy nguồn tham khảo ngoài cho câu hỏi này, nhưng hiện chưa tạo được phần tóm tắt grounded.";
};

const normalizeLooseText = (value = "") =>
    String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

const buildGeneralFallbackReplyByMessage = ({
    message = "",
    language = "vi",
}) => {
    const text = normalizeLooseText(message);

    const isGreeting =
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey") ||
        text.includes("xin chao") ||
        text === "chao" ||
        text.includes("chao shop") ||
        text.includes("alo");

    const asksHelp =
        text.includes("giup minh") ||
        text.includes("help me") ||
        text.includes("can you help me") ||
        text.includes("shop oi");

    const asksCapability =
        text.includes("ban lam duoc gi") ||
        text.includes("ban ho tro gi") ||
        text.includes("what can you do");

    if (language === "en") {
        if (isGreeting) {
            return "Hi there! I can help you find products, services, bookings, or orders.";
        }

        if (asksHelp) {
            return "Sure, I’m here. Do you want help with products, services, bookings, or orders?";
        }

        if (asksCapability) {
            return "I can help you find products, services, bookings, and orders. What would you like to check first?";
        }

        return "I can help you find products, services, bookings, or orders. What do you need?";
    }

    if (isGreeting) {
        return "Chào bạn nha! Mình có thể hỗ trợ tìm sản phẩm, dịch vụ, booking hoặc đơn hàng.";
    }

    if (asksHelp) {
        return "Mình đây nha. Bạn muốn mình hỗ trợ sản phẩm, dịch vụ, booking hay đơn hàng?";
    }

    if (asksCapability) {
        return "Mình có thể giúp bạn tìm sản phẩm, dịch vụ, kiểm tra booking và đơn hàng. Bạn muốn xem phần nào trước?";
    }

    return "Mình có thể hỗ trợ tìm sản phẩm, dịch vụ, booking hoặc đơn hàng. Bạn đang cần gì nhé?";
};

const limitReplySentences = (text = "", maxSentences = 3) => {
    const value = String(text || "").trim();
    if (!value) return "";

    const parts = value
        .split(/(?<=[.!?。！？])/)
        .map((x) => x.trim())
        .filter(Boolean);

    if (parts.length <= maxSentences) {
        return value;
    }

    return parts.slice(0, maxSentences).join(" ").trim();
};

const buildDisambiguationCards = ({ groupedMatches = {}, language = "vi" }) => {
    const cards = [];
    const buildGroupCard = ({
        key,
        items,
        title,
        description,
        shortDescription,
        badge,
        query,
    }) => {
        if (!Array.isArray(items) || items.length === 0) return;

        cards.push({
            type: "disambiguation_group",
            id: `group_${key}`,
            title,
            description,
            short_description: shortDescription,
            badge,
            action_label:
                language === "en" ? "View this group" : "Xem nhóm này",
            action_value: key,
            query,
            items,
            item_count: items.length,
        });
    };
    const milkItems = Array.isArray(groupedMatches.milk_food)
        ? groupedMatches.milk_food
        : [];

    const hygieneItems = Array.isArray(groupedMatches.hygiene_care)
        ? groupedMatches.hygiene_care
        : [];

    const relatedFoodItems = Array.isArray(groupedMatches.related_food)
        ? groupedMatches.related_food
        : [];
    const dogFoodItems = Array.isArray(groupedMatches.dog_food)
        ? groupedMatches.dog_food
        : [];

    const catFoodItems = Array.isArray(groupedMatches.cat_food)
        ? groupedMatches.cat_food
        : [];
    const accessoryItems = Array.isArray(groupedMatches.pet_accessories)
        ? groupedMatches.pet_accessories
        : [];

    const toyItems = Array.isArray(groupedMatches.pet_toys)
        ? groupedMatches.pet_toys
        : [];

    buildGroupCard({
        key: "dog_food",
        items: dogFoodItems,
        title: "Thức ăn cho chó",
        description: `Có ${dogFoodItems.length} sản phẩm thức ăn cho chó đang giảm giá.`,
        shortDescription: "Nhóm thức ăn cho chó",
        badge: "Dog Food",
        query: "thức ăn cho chó đang giảm giá",
    });

    buildGroupCard({
        key: "cat_food",
        items: catFoodItems,
        title: "Thức ăn cho mèo",
        description: `Có ${catFoodItems.length} sản phẩm thức ăn cho mèo đang giảm giá.`,
        shortDescription: "Nhóm thức ăn cho mèo",
        badge: "Cat Food",
        query: "thức ăn cho mèo đang giảm giá",
    });

    // buildGroupCard({
    //     key: "hygiene_care",
    //     items: hygieneItems,
    //     title: "Vệ sinh & chăm sóc",
    //     description: `Có ${hygieneItems.length} sản phẩm vệ sinh & chăm sóc đang giảm giá.`,
    //     shortDescription: "Nhóm vệ sinh & chăm sóc",
    //     badge: "Care",
    //     query: "sản phẩm vệ sinh chăm sóc đang giảm giá",
    // });

    buildGroupCard({
        key: "pet_accessories",
        items: accessoryItems,
        title: "Phụ kiện thú cưng",
        description: `Có ${accessoryItems.length} sản phẩm phụ kiện đang giảm giá.`,
        shortDescription: "Nhóm phụ kiện thú cưng",
        badge: "Accessories",
        query: "phụ kiện thú cưng đang giảm giá",
    });

    buildGroupCard({
        key: "pet_toys",
        items: toyItems,
        title: "Đồ chơi thú cưng",
        description: `Có ${toyItems.length} sản phẩm đồ chơi đang giảm giá.`,
        shortDescription: "Nhóm đồ chơi thú cưng",
        badge: "Toys",
        query: "đồ chơi thú cưng đang giảm giá",
    });

    if (milkItems.length > 0) {
        cards.push({
            type: "disambiguation_group",
            id: "group_milk_food",
            title: language === "en" ? "Nutritional milk" : "Sữa dinh dưỡng",
            description:
                language === "en"
                    ? `I found ${milkItems.length} milk-related item(s).`
                    : `Mình thấy ${milkItems.length} sản phẩm thuộc nhóm sữa dinh dưỡng.`,
            short_description:
                language === "en"
                    ? "Milk-related nutrition products"
                    : "Nhóm sản phẩm sữa dinh dưỡng",
            badge: language === "en" ? "Milk" : "Dinh dưỡng",
            action_label:
                language === "en" ? "View this group" : "Xem nhóm này",
            action_value: "milk_food",
            items: milkItems.slice(0, 3),
        });
    }

    if (hygieneItems.length > 0) {
        cards.push({
            type: "disambiguation_group",
            id: "group_hygiene_care",
            title:
                language === "en"
                    ? "Shampoo / Hygiene & Care"
                    : "Sữa tắm / Vệ sinh",
            description:
                language === "en"
                    ? `I found ${hygieneItems.length} related hygiene item(s).`
                    : `Mình thấy ${hygieneItems.length} sản phẩm thuộc nhóm vệ sinh.`,
            short_description:
                language === "en"
                    ? "Hygiene & care products"
                    : "Nhóm sản phẩm vệ sinh & chăm sóc",
            badge: language === "en" ? "Care" : "Vệ sinh",
            action_label:
                language === "en" ? "View this group" : "Xem nhóm này",
            action_value: "hygiene_care",
            items: hygieneItems.slice(0, 3),
        });
    }

    if (relatedFoodItems.length > 0) {
        cards.push({
            type: "disambiguation_group",
            id: "group_related_food",
            title: language === "en" ? "Related food" : "Thức ăn liên quan",
            description:
                language === "en"
                    ? `I also found ${relatedFoodItems.length} related food item(s).`
                    : `Mình cũng thấy ${relatedFoodItems.length} sản phẩm thức ăn liên quan.`,
            short_description:
                language === "en"
                    ? "Related food products"
                    : "Nhóm sản phẩm thức ăn liên quan",
            badge: language === "en" ? "Related" : "Liên quan",
            action_label:
                language === "en" ? "View this group" : "Xem nhóm này",
            action_value: "related_food",
            items: relatedFoodItems.slice(0, 2),
        });
    }

    return cards;
};

const buildProductCard = (item, index, language) => {
    const matchedVariant = item.matched_variant || null;
    const displayPrice = Number(item.price || 0);
    const displayOriginalPrice = Number(item.original_price || 0);

    const isDiscounted = displayOriginalPrice > displayPrice;
    const discountPercent = calcDiscountPercent(
        displayPrice,
        displayOriginalPrice,
    );

    return {
        type: "product",
        id: item.product_id,
        name: item.name,
        description: item.description || "",
        short_description: truncateText(item.description || "", 88),
        category: item.category || null,
        slug: item.slug || null,
        price: displayPrice,
        original_price: displayOriginalPrice,
        price_min: item.price_min,
        price_max: item.price_max,
        has_variants: item.has_variants,
        is_single_product: !item.has_variants,
        quantity: item.quantity,
        stock_status: getStockStatus(item.quantity),
        image: item.image || null,

        matched_variant: item.has_variants ? matchedVariant : null,
        variants: item.has_variants ? item.variants || [] : [],
        matched_variants: item.has_variants ? item.matched_variants || [] : [],
        all_variants_count: item.has_variants
            ? item.all_variants_count || 0
            : 0,
        matched_variants_count: item.has_variants
            ? item.matched_variants_count || 0
            : 0,

        has_discounted_variants: item.has_variants
            ? Boolean(item.has_discounted_variants)
            : false,
        has_non_discounted_variants: item.has_variants
            ? Boolean(item.has_non_discounted_variants)
            : false,
        has_mixed_discount_variants: item.has_variants
            ? Boolean(item.has_mixed_discount_variants)
            : false,

        is_best_match: index === 0,
        is_discounted: isDiscounted,
        discount_percent: discountPercent,

        badge:
            index === 0
                ? language === "en"
                    ? "Best match"
                    : "Phù hợp nhất"
                : isDiscounted
                  ? language === "en"
                      ? `-${discountPercent}%`
                      : `Giảm ${discountPercent}%`
                  : null,

        action_url: item.slug
            ? `/shop/${item.slug}`
            : `/shop/${item.product_id}`,
        action_label: getActionLabel(language, "product"),
    };
};

const isGenericLlmFailure = (text = "") => {
    const value = String(text || "")
        .trim()
        .toLowerCase();

    if (!value) return true;

    const genericFailures = [
        "xin loi, toi chua the tra loi luc nay.",
        "xin lỗi, tôi chưa thể trả lời lúc này.",
        "sorry, i cannot answer that right now.",
        "sorry, i can't answer that right now.",
        "xin lỗi, ai đang gặp lỗi hệ thống.",
        "xin loi, ai dang gap loi he thong.",
        "xin lỗi, ai chưa sẵn sàng.",
        "xin loi, ai chua san sang.",
        "xin lỗi, mình chưa có câu trả lời phù hợp.",
        "xin loi, minh chua co cau tra loi phu hop.",
        "sorry, the ai is having a system error.",
        "sorry, ai is not ready yet.",
    ];

    return genericFailures.includes(value);
};

const pickBestKnowledgeItem = ({ knowledgeItems = [], userQuestion = "" }) => {
    const question = String(userQuestion || "").toLowerCase();

    const scoreItem = (item = {}) => {
        const title = String(item.title || "").toLowerCase();
        const content = String(item.content || item.text || "").toLowerCase();
        const source = String(item.source || "").toLowerCase();
        const haystack = `${title} ${content} ${source}`;

        let score = 0;

        if (
            question.includes("thanh phan") ||
            question.includes("ingredient") ||
            question.includes("ingredients")
        ) {
            if (haystack.includes("thanh phan")) score += 10;
            if (haystack.includes("ingredient")) score += 10;
            if (haystack.includes("ingredients")) score += 10;
            if (haystack.includes("cach dung")) score -= 6;
            if (haystack.includes("huong dan")) score -= 4;
            if (haystack.includes("su dung")) score -= 4;
        }

        if (
            question.includes("cach dung") ||
            question.includes("su dung") ||
            question.includes("how to use") ||
            question.includes("usage")
        ) {
            if (haystack.includes("cach dung")) score += 10;
            if (haystack.includes("huong dan")) score += 8;
            if (haystack.includes("su dung")) score += 8;
            if (haystack.includes("usage")) score += 8;
            if (haystack.includes("thanh phan")) score -= 5;
            if (haystack.includes("ingredient")) score -= 5;
        }

        if (
            question.includes("cong dung") ||
            question.includes("tac dung") ||
            question.includes("benefit")
        ) {
            if (haystack.includes("cong dung")) score += 10;
            if (haystack.includes("tac dung")) score += 10;
            if (haystack.includes("benefit")) score += 8;
            if (haystack.includes("usage")) score -= 3;
            if (haystack.includes("ingredient")) score -= 3;
        }

        if (
            question.includes("luu y") ||
            question.includes("canh bao") ||
            question.includes("warning")
        ) {
            if (haystack.includes("luu y")) score += 10;
            if (haystack.includes("canh bao")) score += 10;
            if (haystack.includes("warning")) score += 10;
        }

        return score;
    };

    const sorted = [...knowledgeItems].sort(
        (a, b) => scoreItem(b) - scoreItem(a),
    );
    return sorted[0] || null;
};

const buildKnowledgeFallbackReply = ({
    item,
    knowledgeItems = [],
    userQuestion = "",
    language = "vi",
    requestedKnowledgeType = null,
}) => {
    const pickKnowledgeByType = ({
        knowledgeItems = [],
        requestedType = null,
    }) => {
        if (!requestedType) return null;
        return (
            knowledgeItems.find(
                (k) =>
                    normalizeLooseText(k.knowledge_type) ===
                    normalizeLooseText(requestedType),
            ) || null
        );
    };

    const exactKnowledge =
        pickKnowledgeByType({
            knowledgeItems,
            requestedType: requestedKnowledgeType,
        }) || pickBestKnowledgeItem({ knowledgeItems, userQuestion });

    const productName =
        item?.name || (language === "en" ? "this product" : "sản phẩm này");

    const content = String(
        exactKnowledge?.content || exactKnowledge?.text || "",
    ).trim();

    if (!content) {
        return language === "en"
            ? `I found the related product ${productName}, but I still do not have enough internal knowledge content to answer accurately.`
            : `Mình đã xác định được sản phẩm liên quan là ${productName}, nhưng hiện chưa đủ nội dung kiến thức nội bộ để trả lời chính xác.`;
    }

    const shortContent =
        content.length > 220 ? `${content.slice(0, 220).trim()}...` : content;

    return `${productName}: ${shortContent}`;
};

const buildServiceCard = (item, index, language, intent) => ({
    type: "service",
    id: item.service_id,
    name: item.name,
    description: item.description || "",
    short_description: truncateText(item.description || "", 88),
    category: item.category || null,
    price: item.price,
    duration: item.duration,
    image: item.image || null,
    is_best_match: index === 0,
    badge:
        index === 0
            ? language === "en"
                ? "Best match"
                : "Phù hợp nhất"
            : null,
    action_url: `/service/${item.service_id}`,
    action_label:
        intent === "service_booking_intent"
            ? getActionLabel(language, "book_now")
            : getActionLabel(language, "service"),
});

const buildKnowledgeCards = ({
    items = [],
    language,
    answerMode,
    knowledgeItems = [],
}) => {
    return items.slice(0, 2).map((item, index) => ({
        type: item.product_id ? "product" : "service",
        id: item.product_id || item.service_id,
        name: item.name,
        description: item.description || "",
        short_description: truncateText(item.description || "", 88),
        category: item.category || null,
        image: item.image || null,
        price: item.price ?? null,
        original_price: item.original_price ?? null,
        duration: item.duration ?? null,
        quantity: item.quantity ?? null,
        stock_status:
            typeof item.quantity !== "undefined"
                ? getStockStatus(item.quantity)
                : null,
        badge:
            index === 0
                ? language === "en"
                    ? "Related item"
                    : answerMode === "external_reference"
                      ? "Sản phẩm liên quan"
                      : "Liên quan nhất"
                : null,
        action_url: item.product_id
            ? item.slug
                ? `/shop/${item.slug}`
                : `/shop/${item.product_id}`
            : item.service_id
              ? `/service/${item.service_id}`
              : null,
        action_label: item.product_id
            ? getActionLabel(language, "product")
            : getActionLabel(language, "service"),
        knowledge_count: knowledgeItems.length || 0,
    }));
};

const isBroadBrowseProductQuestion = (context = {}) => {
    const normalizedQuestion = normalizeLooseText(context?.user_question || "");
    const totalMatched = Number(
        context?.total_matched || (context?.items || []).length || 0,
    );
    const analysis = context?.analysis || {};

    if (analysis?.productForm || analysis?.discountMode) return false;
    if (totalMatched <= 0) return false;

    const broadSignals = [
        "shop co",
        "co ban",
        "san pham nao",
        "san pham gi",
        "san pham cho",
        "co gi cho",
        "dog products",
        "cat products",
        "products for dog",
        "products for cat",
        "pet products",
        "pet accessories",
        "phu kien cho thu cung",
    ];

    return broadSignals.some((signal) => normalizedQuestion.includes(signal));
};

const formatResponse = ({
    intent,
    rawReply,
    context,
    analysis,
    currentUser,
}) => {
    const language = pickLanguage(analysis, context);
    const isLoggedIn = Boolean(currentUser?.user_id);
    let safeRawReply = sanitizeReplyText(rawReply);
    safeRawReply = limitReplySentences(safeRawReply, 3);
    const answerMode = context?.answer_mode || "general_fallback";

    if (["db_strict", "internal_knowledge"].includes(answerMode)) {
        safeRawReply = stripExternalLinks(safeRawReply);
    }

    let cards = [];
    let reply = getFallbackReply(language, context?.type);
    let suggestions = getSuggestionsByContext({
        language,
        contextType: context?.type,
        isLoggedIn,
        intent,
        context,
    });
    if (context?.type === "disambiguation") {
        cards = buildDisambiguationCards({
            groupedMatches: context?.grouped_matches || {},
            language,
        });

        reply =
            context?.reply ||
            (language === "en"
                ? "I found a few related groups. Which one do you want to see first?"
                : "Mình thấy có vài nhóm liên quan. Bạn muốn xem nhóm nào trước?");

        return {
            intent,
            reply,
            cards,
            suggestions,
            meta: {
                language,
                isLoggedIn,
                confidence: context?.confidence ?? 0,
                matched_categories: context?.matched_categories || [],
                applied_filters: context?.applied_filters || [],
                context_type: context?.type || "general",
                product_form: context?.analysis?.productForm || null,
                discount_mode: context?.analysis?.discountMode || null,
                answer_mode: answerMode,
                answer_mode_reason: context?.answer_mode_reason || null,
                answer_source: context?.answer_source || "semantic_grouped",
                failure_reason: context?.failure_reason || null,
                knowledge_count: (context?.knowledge_items || []).length || 0,
                external_source_count:
                    (context?.external_sources || []).length || 0,
            },
        };
    }

    if (context?.type === "products") {
        const appliedFilters = context?.applied_filters || [];
        const productFormNoMatch = appliedFilters.includes(
            "product_form_no_match",
        );

        if (productFormNoMatch) {
            const formLabel = getFormLabel(
                context?.analysis?.productForm || null,
                language,
            );
            const replyText =
                language === "en"
                    ? `I couldn't find any ${formLabel || "matching"} products in the shop right now. Do you want to try a different type, or share your budget?`
                    : `Hiện shop chưa thấy sản phẩm ${formLabel || "phù hợp"} trong dữ liệu. Bạn muốn đổi loại khác hoặc cho mình biết ngân sách không?`;

            return {
                intent,
                reply: replyText,
                cards: [],
                suggestions,
                meta: {
                    language,
                    isLoggedIn,
                    confidence: context?.confidence ?? 0,
                    matched_categories: context?.matched_categories || [],
                    applied_filters: appliedFilters,
                    context_type: context?.type || "general",
                    product_form: context?.analysis?.productForm || null,
                    discount_mode: context?.analysis?.discountMode || null,
                    answer_mode: answerMode,
                    answer_mode_reason: context?.answer_mode_reason || null,
                    answer_source: "db",
                    failure_reason:
                        context?.failure_reason || "product_form_no_match",
                    knowledge_count:
                        (context?.knowledge_items || []).length || 0,
                    external_source_count:
                        (context?.external_sources || []).length || 0,
                },
            };
        }

        const isBroadBrowseQuestion = isBroadBrowseProductQuestion(context);

        if ((context?.confidence ?? 0) < 0.5 && !isBroadBrowseQuestion) {
            return {
                intent,
                reply: getLowConfidenceReply(language),
                cards: [],
                suggestions,
                meta: {
                    language,
                    isLoggedIn,
                    confidence: context?.confidence ?? 0,
                    matched_categories: context?.matched_categories || [],
                    applied_filters: appliedFilters,
                    context_type: context?.type || "general",
                    product_form: context?.analysis?.productForm || null,
                    discount_mode: context?.analysis?.discountMode || null,
                    answer_mode: answerMode,
                    answer_mode_reason: context?.answer_mode_reason || null,
                    answer_source:
                        answerMode === "db_strict"
                            ? "db"
                            : answerMode === "internal_knowledge"
                              ? "internal_knowledge"
                              : answerMode === "external_reference"
                                ? "external_reference"
                                : "fallback",
                    failure_reason: context?.failure_reason || "low_confidence",
                    knowledge_count:
                        (context?.knowledge_items || []).length || 0,
                    external_source_count:
                        (context?.external_sources || []).length || 0,
                },
            };
        }

        const budget = extractBudget(context?.user_question || "");
        const items = context.items || [];
        const budgetFiltered =
            budget && Number(budget) > 0
                ? items.filter((item) => Number(item.price || 0) <= budget)
                : items;

        if (budget && budgetFiltered.length === 0) {
            reply =
                language === "en"
                    ? `I couldn't find products within ${budget} VND yet. Do you want to increase the budget or view similar items?`
                    : `Mình chưa thấy sản phẩm nào trong khoảng ${budget} VND. Bạn muốn tăng ngân sách hoặc xem sản phẩm gần mức đó không?`;
            cards = [];
        } else {
            cards = budgetFiltered.map((item, index) =>
                buildProductCard(item, index, language),
            );

            reply = buildProductReply({
                items: budgetFiltered,
                language,
                context,
            });
        }
    } else if (context?.type === "services") {
        if ((context?.confidence ?? 0) < 0.5) {
            return {
                intent,
                reply: getLowConfidenceReply(language),
                cards: [],
                suggestions,
                meta: {
                    language,
                    isLoggedIn,
                    confidence: context?.confidence ?? 0,
                    matched_categories: context?.matched_categories || [],
                    applied_filters: context?.applied_filters || [],
                    context_type: context?.type || "general",
                    product_form: context?.analysis?.productForm || null,
                    discount_mode: context?.analysis?.discountMode || null,
                    answer_mode: answerMode,
                    answer_mode_reason: context?.answer_mode_reason || null,
                    answer_source:
                        answerMode === "db_strict"
                            ? "db"
                            : answerMode === "internal_knowledge"
                              ? "internal_knowledge"
                              : answerMode === "external_reference"
                                ? "external_reference"
                                : "fallback",
                    failure_reason: context?.failure_reason || "low_confidence",
                    knowledge_count:
                        (context?.knowledge_items || []).length || 0,
                    external_source_count:
                        (context?.external_sources || []).length || 0,
                },
            };
        }

        cards = (context.items || []).map((item, index) =>
            buildServiceCard(item, index, language, intent),
        );

        reply = buildServiceReply({
            items: context.items || [],
            language,
            intent,
        });
    } else if (context?.type === "bookings") {
        cards = (context.items || []).map((item, index) => ({
            type: "booking",
            id: item.booking_id,
            booking_code: item.booking_code,
            status: item.status,
            date: item.date,
            check_in: item.check_in,
            check_out: item.check_out,
            total_price: item.total_price,
            is_best_match: index === 0,
            badge:
                index === 0
                    ? language === "en"
                        ? "Latest"
                        : "Gần nhất"
                    : null,
            action_url: `/profile/bookings/${item.booking_id}`,
            action_label: getActionLabel(language, "booking"),
        }));

        reply = buildBookingReply({
            items: context.items || [],
            language,
        });
    } else if (context?.type === "orders") {
        cards = (context.items || []).map((item, index) => ({
            type: "order",
            id: item.order_id,
            order_code: item.order_code,
            status: item.status,
            total_price: item.total_price,
            created_at: item.created_at,
            items: item.items || [],
            item_count: item.item_count || 0,
            preview_image: item.preview_image || null,
            is_best_match: index === 0,
            badge:
                index === 0
                    ? language === "en"
                        ? "Latest"
                        : "Gần nhất"
                    : null,
            action_url: `/profile/orders/${item.order_id}`,
            action_label: getActionLabel(language, "order"),
        }));

        reply = buildOrderReply({
            items: context.items || [],
            language,
        });
    } else if (context?.type === "knowledge") {
        cards = buildKnowledgeCards({
            items: context.items || [],
            language,
            answerMode,
            knowledgeItems: context.knowledge_items || [],
        });

        const firstItem = (context.items || [])[0] || null;
        const knowledgeItems = context.knowledge_items || [];

        if (context?.failure_reason === "ambiguous_reference_no_context") {
            reply =
                context?.reply ||
                (language === "en"
                    ? "Which exact product are you asking about?"
                    : "Bạn đang hỏi sản phẩm nào cụ thể vậy?");
        } else if (
            knowledgeItems.length > 0 &&
            (isGenericLlmFailure(safeRawReply) || !safeRawReply)
        ) {
            reply = buildKnowledgeFallbackReply({
                item: firstItem,
                knowledgeItems,
                userQuestion: context?.user_question || "",
                language,
                requestedKnowledgeType:
                    context?.requested_knowledge_type || null,
            });
        } else {
            reply =
                safeRawReply ||
                context?.reply ||
                (language === "en"
                    ? "I found a related item, but internal knowledge is still limited right now."
                    : "Mình đã xác định được sản phẩm liên quan, nhưng kho kiến thức nội bộ hiện vẫn còn hạn chế.");
        }
    } else if (context?.type === "external_reference") {
        cards = buildKnowledgeCards({
            items: context.items || [],
            language,
            answerMode,
            knowledgeItems: [],
        });

        if (isGenericLlmFailure(safeRawReply) || !safeRawReply) {
            reply = buildExternalFallbackReply({
                externalSources: context?.external_sources || [],
                language,
            });
        } else {
            reply =
                safeRawReply ||
                context?.reply ||
                (language === "en"
                    ? "This answer is based on external reference mode, but grounded outside sources are not connected yet."
                    : "Câu hỏi này thuộc dạng tham khảo ngoài hệ thống, nhưng hiện backend chưa kết nối nguồn ngoài một cách grounded.");
        }
    } else if (context?.type === "auth_required") {
        cards = [
            {
                type: "auth_cta",
                id: "login_required",
                title:
                    language === "en"
                        ? "Log in to view your personal data"
                        : "Đăng nhập để xem dữ liệu cá nhân",
                description:
                    context?.reply ||
                    getFallbackReply(language, "auth_required"),
                short_description:
                    context?.reply ||
                    getFallbackReply(language, "auth_required"),
                badge: language === "en" ? "Login required" : "Cần đăng nhập",
                action_url: "/login",
                action_label: getActionLabel(language, "login"),
            },
        ];

        reply =
            context?.reply ||
            safeRawReply ||
            getFallbackReply(language, "auth_required");
    } else {
        reply =
            safeRawReply ||
            context?.reply ||
            (context?.type === "general"
                ? buildGeneralFallbackReplyByMessage({
                      message: context?.user_question || "",
                      language,
                  })
                : getFallbackReply(language, context?.type || "default"));
    }

    if (
        !(context?.items || []).length &&
        context?.type !== "auth_required" &&
        context?.type !== "knowledge" &&
        context?.type !== "external_reference"
    ) {
        reply =
            safeRawReply ||
            context?.reply ||
            (context?.type === "general"
                ? buildGeneralFallbackReplyByMessage({
                      message: context?.user_question || "",
                      language,
                  })
                : getFallbackReply(language, context?.type || "default"));
    }

    return {
        intent,
        reply,
        cards,
        suggestions,
        meta: {
            language,
            isLoggedIn,
            confidence: context?.confidence ?? 0,
            matched_categories: context?.matched_categories || [],
            applied_filters: context?.applied_filters || [],
            context_type: context?.type || "general",
            product_form: context?.analysis?.productForm || null,
            discount_mode: context?.analysis?.discountMode || null,
            answer_mode: answerMode,
            answer_mode_reason: context?.answer_mode_reason || null,
            answer_source:
                context?.answer_source ||
                (answerMode === "db_strict"
                    ? "db"
                    : answerMode === "internal_knowledge"
                      ? "internal_knowledge"
                      : answerMode === "external_reference"
                        ? "external_reference"
                        : "fallback"),
            failure_reason: context?.failure_reason || null,
            knowledge_count: (context?.knowledge_items || []).length || 0,
            external_source_count:
                (context?.external_sources || []).length || 0,
        },
    };
};

module.exports = formatResponse;
