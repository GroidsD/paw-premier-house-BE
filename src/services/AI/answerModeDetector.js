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
    currentUser = {},
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
                        term.includes(normalizedKeyword),
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
            "giup minh voi",
            "tu van giup minh",
        ]) || hasTerm(["help", "hello", "alo"]);

    const hasStrictCommerceIntent =
        Boolean(analysis?.discountMode) ||
        hasPhrase([
            "gia bao nhieu",
            "bao nhieu tien",
            "con hang",
            "het hang",
            "co san khong",
            "co hang khong",
            "so luong",
            "giam gia",
            "khuyen mai",
            "dang sale",
            "co ban khong",
            "shop co",
            "co size nao",
            "co mau nao",
            "co loai nao",
            "co chai",
            "co tui",
            "do you have",
            "available",
            "in stock",
            "price",
            "how much",
            "promotion",
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
            "gia",
            "ton kho",
            "so luong",
            "variant",
            "size",
            "color",
        ]);

    const hasConcreteProductEntity =
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
            "wipes",
            "cleaning wipes",
            "wet wipes",
            "litter",
            "cat litter",
            "bentonite",
            "brush",
            "grooming brush",
        ]);

    const hasMilkEntitySignal =
        hasTerm(["milk", "sua"]) &&
        !hasPhrase(["sua me", "sua cong thuc", "sua bo", "breast milk"]);

    const hasConcreteServiceEntity =
        hasTerm(["grooming", "spa", "hotel", "dich vu"]) &&
        (hasPhrase([
            "shop",
            "ben minh",
            "cua shop",
            "dat lich",
            "book",
            "booking",
            "dich vu cua",
            "dang ky",
        ]) ||
            intent === "service_booking_intent" ||
            intent === "service_search");

    const hasConcreteShopEntity =
        hasConcreteProductEntity ||
        hasMilkEntitySignal ||
        hasConcreteServiceEntity;

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
            "thanh phan gi",
            "co thanh phan gi",
            "luu y",
            "gom nhung gi",
            "bao gom gi",
            "bao gom nhung gi",
            "co nhung gi",
            "cong dung",
            "tac dung",
            "dung cho",
            "phu hop cho",
            "co an toan khong",
            "an toan khong",
            "how to use",
            "how do i use",
            "what is included",
            "what does it include",
            "ingredients",
            "ingredient",
            "benefit of this product",
            "is it safe",
            "suitable for",
        ]) ||
        hasTerm([
            "usage",
            "instruction",
            "ingredient",
            "ingredients",
            "warning",
            "include",
            "included",
            "use",
            "dung",
            "su dung",
            "thanh phan",
            "luu y",
            "cong dung",
            "tac dung",
            "safe",
            "safety",
            "suitable",
        ]);

    const hasKnowledgeQuestionPattern =
        hasPhrase([
            "co tot khong",
            "tot khong",
            "co gi tot",
            "co tac dung gi",
            "co loi gi",
            "co hai khong",
            "co an toan khong",
            "an toan khong",
            "co nen dung",
            "nen dung khong",
            "co anh huong",
            "co phu hop",
            "phu hop khong",
            "co nen cho an",
            "nen cho an khong",
            "is it good",
            "is it safe",
            "is it ok",
            "is it beneficial",
            "what does it do",
            "what are the benefits",
            "good for",
            "safe for",
            "ok for",
            "harmful",
            "is it harmful",
        ]) ||
        (hasTerm(["tot", "hai", "anh huong", "loi ich", "benefit"]) &&
            hasConcreteShopEntity);

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
            "co tac dung gi cho suc khoe",
            "giup ich cho suc khoe",
            "good for health",
            "helpful for health",
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

    const hasContextualRef = Boolean(analysis?.contextualReference);

    const hasLastProductContext = Boolean(
        currentUser?.lastProductId ||
        currentUser?.currentProductId ||
        currentUser?.lastProductName ||
        currentUser?.currentProductName,
    );

    const hasLastServiceContext = Boolean(
        currentUser?.lastServiceId || currentUser?.currentServiceId,
    );

    const hasResolvedProductContext =
        hasLastProductContext || Boolean(analysis?.explicitProductName);

    const hasShortKnowledgeOnlyQuestion =
        (hasInternalKnowledgeSignals || hasKnowledgeQuestionPattern) &&
        hasResolvedProductContext;

    if (hasShortKnowledgeOnlyQuestion) {
        return {
            mode: ANSWER_MODES.INTERNAL_KNOWLEDGE,
            reason: "knowledge question with existing resolved product context",
        };
    }
    const hasResolvedServiceContext = hasLastServiceContext;

    if (isAuthIntent) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "authenticated transactional intent",
        };
    }
    const hasBroadBrowseProductQuestion = hasPhrase([
        "shop co",
        "shop ban co",
        "co do choi",
        "co pate",
        "co sua tam",
        "co loai nao",
        "co gi cho cho",
        "co gi cho meo",
    ]);

    if (hasBroadBrowseProductQuestion && hasConcreteProductEntity) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "broad browse product question should stay in db mode",
        };
    }
    if (intent === "general_support" && isSmallTalkOrVagueSupport) {
        return {
            mode: ANSWER_MODES.GENERAL_FALLBACK,
            reason: "small talk or vague support should stay general",
        };
    }

    if (hasContextualRef) {
        if (
            (hasInternalKnowledgeSignals || hasKnowledgeQuestionPattern) &&
            hasResolvedProductContext
        ) {
            return {
                mode: ANSWER_MODES.INTERNAL_KNOWLEDGE,
                reason: "contextual reference + resolved product + knowledge question",
            };
        }

        if (
            (hasInternalKnowledgeSignals || hasKnowledgeQuestionPattern) &&
            hasResolvedServiceContext
        ) {
            return {
                mode: ANSWER_MODES.INTERNAL_KNOWLEDGE,
                reason: "contextual reference + resolved service + knowledge question",
            };
        }

        if (
            hasStrictCommerceIntent &&
            (hasResolvedProductContext || hasResolvedServiceContext)
        ) {
            return {
                mode: ANSWER_MODES.DB_STRICT,
                reason: "contextual reference + resolved entity + commerce intent",
            };
        }

        if (!hasResolvedProductContext && !hasResolvedServiceContext) {
            return {
                mode: ANSWER_MODES.GENERAL_FALLBACK,
                reason: "contextual reference but no active product/service context",
            };
        }
    }

    if (hasStrictCommerceIntent) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "strict commerce facts should stay in db mode",
        };
    }

    if (hasInternalKnowledgeSignals || hasKnowledgeQuestionPattern) {
        if (hasConcreteProductEntity && hasResolvedProductContext) {
            return {
                mode: ANSWER_MODES.INTERNAL_KNOWLEDGE,
                reason: "product knowledge question with resolved product context",
            };
        }

        if (
            hasConcreteServiceEntity &&
            (hasResolvedServiceContext ||
                intent === "service_search" ||
                intent === "service_booking_intent")
        ) {
            return {
                mode: ANSWER_MODES.INTERNAL_KNOWLEDGE,
                reason: "service knowledge question with resolvable service context",
            };
        }

        if (hasConcreteShopEntity) {
            return {
                mode: ANSWER_MODES.GENERAL_FALLBACK,
                reason: "knowledge question but concrete entity is not resolved enough",
            };
        }
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
