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

    const hasStructuredCommerceSignals =
        hasPhrase([
            "gia bao nhieu",
            "bao nhieu tien",
            "con hang",
            "het hang",
            "co ban",
            "co khong",
            "co loai nao",
            "co mau nao",
            "co size nao",
            "giam gia",
            "khuyen mai",
            "dang sale",
            "booking",
            "don hang",
            "order",
            "lich hen",
            "dat lich",
            "xem san pham",
            "tim san pham",
            "san pham nao",
            "dich vu nao",
            "shop co gi",
            "co gi cho meo",
            "co gi cho cho",
        ]) ||
        hasTerm([
            "gia",
            "price",
            "stock",
            "available",
            "availability",
            "sale",
            "discount",
            "promotion",
            "booking",
            "order",
            "product",
            "service",
            "shop",
            "buy",
            "mua",
        ]);

    const hasInternalKnowledgeSignals =
        hasPhrase([
            "cong dung",
            "cach dung",
            "cach su dung",
            "huong dan su dung",
            "huong dan",
            "luu y",
            "thanh phan",
            "phu hop voi",
            "danh cho",
            "tot cho",
            "nen dung",
            "dung nhu the nao",
            "su dung nhu the nao",
            "gom nhung gi",
            "bao gom gi",
            "bao gom nhung gi",
            "co nhung gi",
            "grooming gom nhung gi",
            "dich vu gom nhung gi",
            "how to use",
            "how to use this",
            "how should i use",
            "how do i use",
            "what does it include",
            "what is included",
        ]) ||
        hasTerm([
            "benefit",
            "usage",
            "instruction",
            "ingredient",
            "warning",
            "suitable",
            "use",
            "include",
            "included",
            "cong dung",
            "cach dung",
            "thanh phan",
            "luu y",
            "phu hop",
        ]);

    const hasExternalKnowledgeSignals =
        hasPhrase([
            "co tac dung gi",
            "tac dung gi",
            "tai sao",
            "vi sao",
            "co nen",
            "nen hay khong",
            "co tot khong",
            "tri benh",
            "chua benh",
            "dinh duong",
            "omega 3",
            "omega",
            "protein",
            "vitamin",
            "benh",
            "tieu chay",
            "non",
            "sot",
            "di ngoai",
        ]) ||
        hasTerm([
            "nutrition",
            "medical",
            "health",
            "disease",
            "illness",
            "omega",
            "vitamin",
            "protein",
            "digestive",
            "dinh duong",
            "suc khoe",
            "benh",
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
            "thuc an",
            "do an",
            "service",
            "dich vu",
            "grooming",
            "spa",
            "hotel",
        ]);

    if (isAuthIntent) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "authenticated transactional intent",
        };
    }

    if (hasExternalKnowledgeSignals && !hasConcreteShopEntity) {
        return {
            mode: ANSWER_MODES.EXTERNAL_REFERENCE,
            reason: "general knowledge without concrete shop entity",
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
        intent === "service_search"
    ) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "structured commerce intent",
        };
    }

    if (hasExternalKnowledgeSignals) {
        return {
            mode: ANSWER_MODES.EXTERNAL_REFERENCE,
            reason: "general knowledge beyond strict db facts",
        };
    }

    if (hasStructuredCommerceSignals) {
        return {
            mode: ANSWER_MODES.DB_STRICT,
            reason: "explicit db/shop question",
        };
    }

    return {
        mode: ANSWER_MODES.GENERAL_FALLBACK,
        reason: "unclear or unsupported question type",
    };
};

detectAnswerMode.ANSWER_MODES = ANSWER_MODES;

module.exports = detectAnswerMode;
