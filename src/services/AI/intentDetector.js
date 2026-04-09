const normalizeText = require("../../utils/normalizeText");

const CHAT_INTENTS = {
    PRODUCT_SEARCH: "product_search",
    SERVICE_SEARCH: "service_search",
    BOOKING_LOOKUP: "booking_lookup",
    RECOMMENDATION_LOOKUP: "recommendation_lookup",
    GENERAL_SUPPORT: "general_support",
};

const detectIntent = (message = "") => {
    const text = normalizeText(message);

    if (
        text.includes("booking") ||
        text.includes("dat lich") ||
        text.includes("lich hen") ||
        text.includes("check in") ||
        text.includes("check out")
    ) {
        return CHAT_INTENTS.BOOKING_LOOKUP;
    }

    if (
        text.includes("goi y") ||
        text.includes("de xuat") ||
        text.includes("recommend")
    ) {
        return CHAT_INTENTS.RECOMMENDATION_LOOKUP;
    }

    if (
        text.includes("dich vu") ||
        text.includes("grooming") ||
        text.includes("spa") ||
        text.includes("hotel") ||
        text.includes("training")
    ) {
        return CHAT_INTENTS.SERVICE_SEARCH;
    }

    if (
        text.includes("san pham") ||
        text.includes("sua tam") ||
        text.includes("thuc an") ||
        text.includes("do choi") ||
        text.includes("phu kien")
    ) {
        return CHAT_INTENTS.PRODUCT_SEARCH;
    }

    return CHAT_INTENTS.GENERAL_SUPPORT;
};

module.exports = detectIntent;
