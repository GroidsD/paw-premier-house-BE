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
            "chao shop",
            "ban oi",
            "alo",
            "giup minh voi",
            "tu van giup minh",
            "tu van giup",
            "tu van ho",
            "tu van",
        ]) ||
        hasTextOrTerm(["help", "hello", "hi", "hey", "alo", "tuvan", "tu van"]);

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

    const asksRecommendation =
        hasTextOrTerm([
            "goi y",
            "de xuat",
            "recommend",
            "recommended",
            "suggest",
            "suggestion",
            "nen dung",
            "nen mua",
            "phu hop",
            "tot cho",
        ]) ||
        hasPhrase([
            "goi y cho minh",
            "de xuat cho minh",
            "nen dung loai nao",
            "nen mua loai nao",
            "san pham nao phu hop",
            "loai nao phu hop",
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

    const hasGeneralKnowledgeSignals = hasTextOrTerm([
        "co may",
        "bao nhieu",
        "la gi",
        "tai sao",
        "vi sao",
        "khi nao",
        "o dau",
        "co dung khong",
        "co that khong",
        "thong tin",
        "tim hieu",
        "kien thuc",
        "facts",
        "fact",
        "how many",
        "what is",
        "why",
        "when",
        "where",
        "is it true",
    ]);

    if (analysis?.productForm) {
        if (asksRecommendation) {
            return CHAT_INTENTS.PRODUCT_RECOMMEND;
        }
        return CHAT_INTENTS.PRODUCT_SEARCH;
    }

    const hasGenericCommerce = hasTextOrTerm([
        "san pham",
        "product",
        "products",
        "pet supplies",
        "shop",
    ]);

    const hasSpecificProductTerms = hasTextOrTerm([
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
        "wipes",
        "cleaning wipes",
        "wet wipes",
        "pet wipes",
        "litter",
        "cat litter",
        "bentonite",
        "brush",
        "grooming brush",
        "accessory",
        "accessories",
        "clothes",
        "pate",
        "kibble",
        "milk",
        "dental care",
        "oral care",
        "giam gia",
        "khuyen mai",
        "sale",
        "discount",
        "discounted",
        "deal",
        "promotion",
    ]);

    const hasPetSignal = Boolean(analysis.petType || analysis.petSize);

    const hasProductWords = Boolean(
        hasSpecificProductTerms ||
        (hasGenericCommerce && hasSpecificProductTerms),
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

    if (asksRecommendation && (hasProductWords || hasPetSignal)) {
        return CHAT_INTENTS.PRODUCT_RECOMMEND;
    }

    if (
        hasPetSignal &&
        !hasProductWords &&
        !hasServiceWords &&
        !asksRecommendation &&
        !hasBookingAction &&
        !asksMyBookings &&
        !asksMyOrders
    ) {
        return CHAT_INTENTS.GENERAL_SUPPORT;
    }

    if (
        hasGeneralKnowledgeSignals &&
        !hasProductWords &&
        !hasServiceWords &&
        !asksRecommendation
    ) {
        return CHAT_INTENTS.GENERAL_SUPPORT;
    }

    if (isSmallTalkOrVagueSupport && !hasProductWords && !hasServiceWords) {
        return CHAT_INTENTS.GENERAL_SUPPORT;
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
