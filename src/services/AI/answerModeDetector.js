const normalizeText = require("../../utils/normalizeText");

const ANSWER_MODES = {
    DB_STRICT: "db_strict",
    INTERNAL_KNOWLEDGE: "internal_knowledge",
    EXTERNAL_REFERENCE: "external_reference",
    GENERAL_FALLBACK: "general_fallback",
};

const normalizeTerms = (terms = []) =>
    (Array.isArray(terms) ? terms : [])
        .map((term) => normalizeText(term))
        .filter((term) => term && term.length >= 2);

const detectAnswerMode = ({
    message = "",
    intent = "",
    analysis = {},
} = {}) => {
    const text = normalizeText(message);
    const terms = normalizeTerms([
        ...(analysis.searchTerms || []),
        ...(analysis.categoryHints || []),
        ...(analysis.rawKeywords || []),
    ]);

    const hasPhrase = (phrases = []) =>
        phrases.some((phrase) => text.includes(normalizeText(phrase)));

    const hasTerm = (keywords = []) =>
        keywords.some((keyword) => {
            const normalizedKeyword = normalizeText(keyword);
            if (!normalizedKeyword) return false;

            return (
                text.includes(normalizedKeyword) ||
                terms.some(
                    (term) =>
                        term === normalizedKeyword ||
                        term.includes(normalizedKeyword) ||
                        normalizedKeyword.includes(term),
                )
            );
        });

    const isAuthIntent =
        intent === "my_bookings" ||
        intent === "my_orders" ||
        intent === "service_booking_intent";

    const isSmallTalkOrVagueSupport =
        hasPhrase([
            "help me",
            "can you help me",
            "i need help",
            "hello",
            "hi",
            "hey",
            "xin chao",
            "chao",
            "ban oi",
            "alo",
            "ban oi",
            "giup minh voi",
            "tu van giup minh",
        ]) || hasTerm(["help", "hello", "hi", "hey", "alo"]);

    const hasStrictCommerceIntent =
        Boolean(analysis?.discountMode) ||
        hasPhrase([
            "gia bao nhieu",
            "bao nhieu tien",
            "con hang",
            "het hang",
            "giam gia",
            "khuyen mai",
            "dang sale",
            "co ban khong",
            "shop co",
            "do you have",
            "available",
            "in stock",
        ]) ||
        hasTerm([
            "price",
            "stock",
            "available",
            "availability",
            "discount",
            "sale",
            "promotion",
            "buy",
            "mua",
        ]);

    const hasConcreteShopEntity =
        Boolean(analysis?.productForm) ||
        hasTerm([
            "pate",
            "kibble",
            "hat",
            "toy",
            "do choi",
            "shampoo",
            "sua tam",
            "snack",
            "milk",
            "sua",
            "wipes",
            "cleaning wipes",
            "wet wipes",
            "litter",
            "cat litter",
            "bentonite",
            "brush",
            "grooming brush",
            "grooming",
            "spa",
            "hotel",
            "service",
            "dich vu",
        ]);

    const hasInternalKnowledgeSignals =
        hasPhrase([
            "cach dung",
            "cach su dung",
            "huong dan su dung",
            "huong dan",
            "dung nhu the nao",
            "su dung nhu the nao",
            "dung ra sao",
            "su dung ra sao",
            "thanh phan",
            "luu y",
            "gom nhung gi",
            "bao gom gi",
            "bao gom nhung gi",
            "co nhung gi",
            "how to use",
            "how do i use",
            "what is included",
            "what does it include",
            "ingredients",
        ]) ||
        hasTerm([
            "usage",
            "instruction",
            "ingredient",
            "warning",
            "include",
            "included",
            "use",
            "dung",
            "su dung",
            "thanh phan",
            "luu y",
        ]);

    const hasGeneralNutritionOrHealthSignals =
        hasPhrase([
            "omega 3",
            "vitamin",
            "protein",
            "dinh duong",
            "suc khoe",
            "che do an",
            "khau phan",
            "nen an gi",
            "an nhu the nao",
            "cho an nhu the nao",
            "an che do",
            "nen cho an",
            "cho nho nen an gi",
            "cho nho an gi",
            "che do cho cho nho",
            "meo con nen an gi",
            "meo con an gi",
            "che do an cho cho nho",
            "che do an cho meo con",
            "co tac dung gi",
            "giup ich gi",
            "giup ich cho",
            "co loi cho",
            "co loi khong",
            "good for",
            "helpful for",
            "benefits of",
            "diet for",
            "feeding guide",
            "feeding guide for kittens",
            "small dogs should eat what",
            "what should small dogs eat",
            "what should kittens eat",
            "what should eat",
            "what to feed",
            "does omega 3 help",
            "is omega 3 good",
        ]) ||
        hasTerm([
            "omega",
            "vitamin",
            "protein",
            "nutrition",
            "health",
            "medical",
            "disease",
            "digestive",
            "diet",
            "feeding",
            "feed",
            "meal",
            "meal plan",
            "benefit",
            "helpful",
            "giup ich",
            "co loi",
            "dinh duong",
            "khau phan",
            "an che do",
            "nen an",
            "cho an",
        ]);

    const hasFeedingOrDietIntent =
        (Boolean(analysis?.petSize) || Boolean(analysis?.petType)) &&
        (hasPhrase([
            "nen cho an",
            "an che do",
            "che do an",
            "cho an nhu the nao",
            "nen an gi",
            "cho nho nen an gi",
            "cho nho an gi",
            "che do cho cho nho",
            "meo con nen an gi",
            "meo con an gi",
            "che do an cho cho nho",
            "che do an cho meo con",
            "diet for",
            "feeding guide",
            "what should eat",
            "what to feed",
        ]) ||
            hasTerm([
                "diet",
                "feeding",
                "feed",
                "meal",
                "meal plan",
                "khau phan",
                "che do an",
                "nen an",
                "cho an",
            ]));

    const hasStructuredCommerceSignals =
        hasPhrase([
            "co loai nao",
            "co mau nao",
            "co size nao",
            "tim san pham",
            "san pham nao",
            "dich vu nao",
            "shop co gi",
            "co gi cho meo",
            "co gi cho cho",
        ]) ||
        hasTerm([
            "product",
            "products",
            "service",
            "services",
            "shop",
            "booking",
            "order",
        ]);

    if (isAuthIntent) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "authenticated transactional intent",
        };
    }

    if (intent === "general_support" && isSmallTalkOrVagueSupport) {
        return {
            mode: ANSWER_MODES.GENERAL_FALLBACK,
            reason: "small talk or vague support should stay general",
        };
    }

    if (hasStrictCommerceIntent) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "strict commerce facts should stay in db mode",
        };
    }

    if (hasFeedingOrDietIntent) {
        return {
            mode: ANSWER_MODES.EXTERNAL_REFERENCE,
            reason: "feeding or diet guidance is external knowledge",
        };
    }

    if (hasGeneralNutritionOrHealthSignals && !hasConcreteShopEntity) {
        return {
            mode: ANSWER_MODES.EXTERNAL_REFERENCE,
            reason: "general nutrition or health knowledge",
        };
    }

    if (hasInternalKnowledgeSignals && hasConcreteShopEntity) {
        return {
            mode: ANSWER_MODES.INTERNAL_KNOWLEDGE,
            reason: "knowledge question tied to a concrete shop entity",
        };
    }

    if (
        intent === "product_search" ||
        intent === "product_recommend" ||
        intent === "service_search" ||
        hasStructuredCommerceSignals
    ) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "structured commerce intent",
        };
    }

    if (hasGeneralNutritionOrHealthSignals) {
        return {
            mode: ANSWER_MODES.EXTERNAL_REFERENCE,
            reason: "general knowledge beyond strict db facts",
        };
    }

    return {
        mode: ANSWER_MODES.GENERAL_FALLBACK,
        reason: "unclear or unsupported question type",
    };
};

detectAnswerMode.ANSWER_MODES = ANSWER_MODES;

module.exports = detectAnswerMode;
