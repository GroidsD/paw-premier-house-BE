const { FALLBACK_REPLY, ACTION_LABELS } = require("./constants");

const pickLanguage = (analysis, context) =>
    analysis?.language || context?.analysis?.language || "vi";

const getFallbackReply = (language, contextType) =>
    FALLBACK_REPLY[language]?.[contextType] ||
    FALLBACK_REPLY[language]?.default ||
    FALLBACK_REPLY.vi.default;

const getLowConfidenceReply = (language = "vi") =>
    language === "en"
        ? "I need a bit more detail to find the right product. You can tell me the pet type, size, or budget."
        : "Mình cần thêm chút thông tin để tìm sản phẩm đúng hơn. Bạn cho mình biết thú cưng nào, size, hoặc ngân sách nhé.";

const extractBudget = (message = "") => {
    const text = String(message || "");
    if (!text) return null;

    const normalized = text.replace(/[,\.]/g, "").toLowerCase();
    const vndMatch = normalized.match(/(\d{2,9})\s*(vnd|đ|dong)/i);
    if (vndMatch) return Number(vndMatch[1] || 0);

    const kMatch = normalized.match(/(\d{1,4})\s*k\b/i);
    if (kMatch) return Number(kMatch[1] || 0) * 1000;

    return null;
};

const getActionLabel = (language, type) =>
    ACTION_LABELS[language]?.[type] || ACTION_LABELS.vi[type];

const truncateText = (text = "", maxLength = 90) => {
    const value = String(text || "").trim();
    if (!value) return "";
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trim()}...`;
};

const calcDiscountPercent = (price, originalPrice) => {
    const current = Number(price || 0);
    const original = Number(originalPrice || 0);

    if (!original || original <= current) return 0;

    return Math.round(((original - current) / original) * 100);
};

const getStockStatus = (quantity) =>
    Number(quantity || 0) > 0 ? "in_stock" : "out_of_stock";

const sanitizeReplyText = (text = "") => {
    const value = String(text || "").trim();
    if (!value) return "";

    return value
        .replace(/!\[.*?\]\((.*?)\)/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const stripExternalLinks = (text = "") =>
    String(text || "")
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();

const getFormLabel = (productForm, language = "vi") => {
    const map = {
        vi: {
            pate: "pate",
            kibble: "hạt",
            milk: "sữa",
            toy: "đồ chơi",
            snack: "snack",
            shampoo: "sữa tắm",
        },
        en: {
            pate: "pate",
            kibble: "kibble",
            milk: "milk",
            toy: "toy",
            snack: "snack",
            shampoo: "shampoo",
        },
    };

    return map[language]?.[productForm] || productForm || "";
};

module.exports = {
    pickLanguage,
    getFallbackReply,
    getLowConfidenceReply,
    getActionLabel,
    truncateText,
    calcDiscountPercent,
    getStockStatus,
    sanitizeReplyText,
    stripExternalLinks,
    extractBudget,
    getFormLabel,
};
