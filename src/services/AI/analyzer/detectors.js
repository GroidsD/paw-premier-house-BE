const normalizeText = require("../../../utils/normalizeText");
const { hasVietnameseDiacritics } = require("./utils");
const {
    VI_STOPWORDS,
    VI_DOMAIN_KEYWORDS,
    EN_STOPWORDS,
    EN_DOMAIN_KEYWORDS,
    PET_TYPE_PATTERNS,
    PET_SIZE_KEYWORDS,
    PRODUCT_FORM_KEYWORDS,
    NON_DISCOUNT_KEYWORDS,
    DISCOUNT_KEYWORDS,
} = require("./constants");

const detectInputLanguage = ({ message, tokens }) => {
    const viScore =
        tokens.filter((token) => VI_STOPWORDS.has(token)).length +
        tokens.filter((token) => VI_DOMAIN_KEYWORDS.has(token)).length +
        (hasVietnameseDiacritics(message) ? 3 : 0);

    const enScore =
        tokens.filter((token) => EN_STOPWORDS.has(token)).length +
        tokens.filter((token) => EN_DOMAIN_KEYWORDS.has(token)).length +
        tokens.filter((token) => /^[a-z]+$/.test(token)).length * 0.05;

    if (viScore > enScore + 1) return "vi";
    if (enScore > viScore + 1) return "en";
    return "mixed";
};

const escapeRegExp = (value = "") =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasWholePhrase = (text = "", phrase = "") => {
    const normalizedText = normalizeText(text);
    const normalizedPhrase = normalizeText(phrase);

    if (!normalizedPhrase) return false;

    const pattern = new RegExp(
        `(^|\\s)${escapeRegExp(normalizedPhrase)}(?=\\s|$)`,
        "i",
    );

    return pattern.test(normalizedText);
};

const detectPetType = (text = "") => {
    const raw = String(text || "");
    const normalized = normalizeText(raw);

    // Order of priority:
    // 1. Explicit mention of cat/meo
    if (
        normalized.includes("meo") ||
        normalized.includes("cat") ||
        normalized.includes("kitten")
    ) {
        return "cat";
    }

    // 2. Explicit mention of dog/cun/puppy
    if (
        normalized.includes("dog") ||
        normalized.includes("puppy") ||
        normalized.includes("cun") ||
        normalized.includes("cho con") ||
        normalized.includes("cho nho") ||
        normalized.includes("cho truong thanh")
    ) {
        return "dog";
    }

    // 3. Fallback for "cho/chó"
    if (normalized.includes("cho")) {
        return "dog";
    }

    return null;
};

const detectPetSize = (text = "") => {
    const hasAnyWholePhrase = (keywords = []) =>
        keywords.some((keyword) => hasWholePhrase(text, keyword));

    if (hasAnyWholePhrase(PET_SIZE_KEYWORDS.small)) return "small";
    if (hasAnyWholePhrase(PET_SIZE_KEYWORDS.medium)) return "medium";
    if (hasAnyWholePhrase(PET_SIZE_KEYWORDS.large)) return "large";

    return null;
};

const detectDiscountMode = (text = "") => {
    const normalized = normalizeText(text);

    if (
        NON_DISCOUNT_KEYWORDS.some((keyword) =>
            normalized.includes(normalizeText(keyword)),
        )
    ) {
        return "non_discounted";
    }

    if (
        DISCOUNT_KEYWORDS.some((keyword) =>
            normalized.includes(normalizeText(keyword)),
        )
    ) {
        return "discounted";
    }

    return null;
};

const detectProductForm = (text = "") => {
    const normalized = normalizeText(text);

    const containsKeyword = (keyword = "") => {
        const normalizedKeyword = normalizeText(keyword);

        if (!normalizedKeyword) return false;

        if (normalizedKeyword.length <= 4) {
            return hasWholePhrase(normalized, normalizedKeyword);
        }

        return normalized.includes(normalizedKeyword);
    };

    const matchedForms = Object.entries(PRODUCT_FORM_KEYWORDS)
        .filter(([, keywords]) =>
            keywords.some((keyword) => containsKeyword(keyword)),
        )
        .map(([form]) => form);

    if (!matchedForms.length) return null;

    const priority = [
        "pate",
        "kibble",
        "milk",
        "toy",
        "snack",
        "shampoo",
        "wipes",
        "litter",
        "brush",
    ];
    return (
        priority.find((item) => matchedForms.includes(item)) || matchedForms[0]
    );
};

const detectMaxPrice = (text = "") => {
    // We use a lighter normalization to keep numbers and units together
    const raw = String(text || "");
    const normalized = raw.toLowerCase().replace(/[,.]/g, "");
    
    // Handle "triệu"
    if (normalized.includes("trieu")) {
        const trieuMatch = normalized.match(/(\d+)\s*trieu/);
        if (trieuMatch) {
            return parseInt(trieuMatch[1], 10) * 1000000;
        }
    }

    // Handle standard units (k, d, vnd)
    // After normalizeText, đ becomes d, vnđ becomes vnd
    const standardNorm = normalizeText(raw);
    const priceMatch = standardNorm.match(/(\d+)\s*(k|vnd|d|dong)\b/);
    
    if (priceMatch) {
        let value = parseInt(priceMatch[1], 10);
        const unit = priceMatch[2];
        
        if (unit === "k") {
            value *= 1000;
        }
        
        return value;
    }

    // fallback for plain numbers in context
    if (standardNorm.includes("tam") || standardNorm.includes("khoang") || standardNorm.includes("duoi")) {
        const plainMatch = standardNorm.match(/\b(\d{4,})\b/);
        if (plainMatch) {
            return parseInt(plainMatch[1], 10);
        }
    }

    return null;
};

module.exports = {
    detectInputLanguage,
    detectPetType,
    detectPetSize,
    detectDiscountMode,
    detectProductForm,
    detectMaxPrice,
};
