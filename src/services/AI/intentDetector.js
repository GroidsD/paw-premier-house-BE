const normalizeText = require("../../utils/normalizeText");

const CHAT_INTENTS = {
    PRODUCT_SEARCH: "product_search",
    SERVICE_SEARCH: "service_search",
    SERVICE_BOOKING_INTENT: "service_booking_intent",
    MY_BOOKINGS: "my_bookings",
    MY_ORDERS: "my_orders",
    PRODUCT_RECOMMEND: "product_recommend",
    GENERAL_SUPPORT: "general_support",
};

const normalizeTerms = (terms = []) =>
    terms
        .map((term) => normalizeText(term))
        .filter((term) => term && term.length >= 3);

const textContains = (text, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return text.includes(normalizedKeyword);
};

const termMatches = (terms, keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword || normalizedKeyword.length < 3) return false;

    return terms.some((term) => {
        if (!term || term.length < 3) return false;

        return term === normalizedKeyword || term.includes(normalizedKeyword);
    });
};

const detectIntent = ({ message = "", analysis = {} } = {}) => {
    const text = normalizeText(message);

    const terms = normalizeTerms([
        ...(analysis.searchTerms || []),
        ...(analysis.categoryHints || []),
        ...(analysis.rawKeywords || []),
    ]);

    const hasPhrase = (phrases = []) =>
        phrases.some((phrase) => textContains(text, phrase));

    const hasTextOrTerm = (keywords = []) =>
        keywords.some(
            (keyword) =>
                textContains(text, keyword) || termMatches(terms, keyword),
        );

    const asksMyBookings = hasPhrase([
        "booking cua toi",
        "lich hen cua toi",
        "booking cua minh",
        "my booking",
        "my bookings",
        "my reservation",
        "my reservations",
        "lich check in cua toi",
        "booking gan nhat",
    ]);

    const asksMyOrders = hasPhrase([
        "don hang cua toi",
        "order cua toi",
        "orders cua toi",
        "my order",
        "my orders",
        "order history",
        "purchase history",
        "lich su don hang",
        "lich su mua hang",
        "don hang gan nhat",
        "recent order",
        "recent orders",
    ]);

    const asksRecommendation = hasTextOrTerm([
        "goi y",
        "de xuat",
        "recommend",
        "recommended",
        "suggest",
        "suggestion",
    ]);

    const hasBookingAction = hasTextOrTerm([
        "dat lich",
        "book",
        "booking",
        "reservation",
        "schedule",
        "check in",
        "check out",
    ]);

    const hasServiceWords = hasTextOrTerm([
        "dich vu",
        "service",
        "services",
        "grooming",
        "spa",
        "hotel",
        "boarding",
        "training",
    ]);

    const hasProductWords = Boolean(
        analysis.petType ||
        analysis.petSize ||
        hasTextOrTerm([
            "san pham",
            "product",
            "products",
            "pet supplies",
            "shop",
            "mua",
            "buy",
            "food",
            "thuc an",
            "do an",
            "hat",
            "snack",
            "toy",
            "toys",
            "shampoo",
            "accessory",
            "accessories",
            "clothes",
            "pate",
            "kibble",
            "dental care",
            "oral care",
            "giam gia",
            "khuyen mai",
            "sale",
            "discount",
            "discounted",
            "deal",
            "promotion",
        ]),
    );

    if (asksMyBookings) {
        return CHAT_INTENTS.MY_BOOKINGS;
    }

    if (asksMyOrders) {
        return CHAT_INTENTS.MY_ORDERS;
    }

    if (hasBookingAction && hasServiceWords) {
        return CHAT_INTENTS.SERVICE_BOOKING_INTENT;
    }

    if (asksRecommendation && hasProductWords) {
        return CHAT_INTENTS.PRODUCT_RECOMMEND;
    }

    if (hasServiceWords) {
        return CHAT_INTENTS.SERVICE_SEARCH;
    }

    if (hasProductWords) {
        return CHAT_INTENTS.PRODUCT_SEARCH;
    }

    return CHAT_INTENTS.GENERAL_SUPPORT;
};

detectIntent.CHAT_INTENTS = CHAT_INTENTS;

module.exports = detectIntent;
