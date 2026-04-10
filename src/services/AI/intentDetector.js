const normalizeText = require("../../utils/normalizeText");

const CHAT_INTENTS = {
    PRODUCT_SEARCH: "product_search",
    SERVICE_SEARCH: "service_search",
    BOOKING_LOOKUP: "booking_lookup",
    RECOMMENDATION_LOOKUP: "recommendation_lookup",
    GENERAL_SUPPORT: "general_support",
};

const normalizeTerms = (terms = []) =>
    terms.map((term) => normalizeText(term)).filter(Boolean);

const textContains = (text, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return text.includes(normalizedKeyword);
};

const termMatches = (terms, keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    return terms.some(
        (term) =>
            term === normalizedKeyword ||
            term.includes(normalizedKeyword) ||
            normalizedKeyword.includes(term),
    );
};

const detectIntent = ({ message = "", analysis = {} } = {}) => {
    const text = normalizeText(message);
    const terms = normalizeTerms([
        ...(analysis.searchTerms || []),
        ...(analysis.categoryHints || []),
        ...(analysis.rawKeywords || []),
    ]);

    const hasTextOrTerm = (keywords = []) =>
        keywords.some(
            (keyword) => textContains(text, keyword) || termMatches(terms, keyword),
        );

    if (
        hasTextOrTerm([
            "booking",
            "dat lich",
            "lich hen",
            "check in",
            "check out",
            "reservation",
            "schedule",
        ])
    ) {
        return CHAT_INTENTS.BOOKING_LOOKUP;
    }

    if (hasTextOrTerm(["goi y", "de xuat", "recommend", "suggest"])) {
        return CHAT_INTENTS.RECOMMENDATION_LOOKUP;
    }

    if (
        hasTextOrTerm([
            "dich vu",
            "service",
            "grooming",
            "spa",
            "hotel",
            "training",
            "boarding",
        ])
    ) {
        return CHAT_INTENTS.SERVICE_SEARCH;
    }

    if (
        analysis.petType ||
        analysis.petSize ||
        hasTextOrTerm([
            "san pham",
            "product",
            "products",
            "shop",
            "mua",
            "buy",
            "food",
            "snack",
            "toy",
            "shampoo",
            "accessory",
            "clothes",
            "pate",
            "kibble",
        ])
    ) {
        return CHAT_INTENTS.PRODUCT_SEARCH;
    }

    return CHAT_INTENTS.GENERAL_SUPPORT;
};

module.exports = detectIntent;
