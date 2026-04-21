const normalizeText = require("../../../utils/normalizeText");
const {
    DOMAIN_SYNONYMS,
    KEEP_IN_PHRASES,
    VI_STOPWORDS,
    EN_STOPWORDS,
    STRONG_PHRASES,
} = require("./constants");

const hasVietnameseDiacritics = (text = "") => /[^\u0000-\u007f]/.test(text);

const tokenize = (text = "") =>
    text
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);

const uniqueList = (items = []) =>
    Array.from(
        new Set(items.map((item) => String(item || "").trim()).filter(Boolean)),
    );

const includesPhrase = (text, keywords = []) =>
    keywords.find((keyword) => text.includes(normalizeText(keyword))) || null;

const buildNgrams = (tokens = [], maxSize = 4) => {
    const ngrams = [];

    for (let size = 2; size <= maxSize; size += 1) {
        for (let index = 0; index <= tokens.length - size; index += 1) {
            ngrams.push(tokens.slice(index, index + size).join(" "));
        }
    }

    return ngrams;
};

const expandSynonyms = (terms = []) => {
    const expanded = [];

    for (const term of terms) {
        expanded.push(term);

        const synonyms = DOMAIN_SYNONYMS[term];
        if (synonyms) {
            expanded.push(...synonyms);
        }
    }

    return uniqueList(expanded);
};

const shouldKeepKeyword = (token, inputLanguage) => {
    if (KEEP_IN_PHRASES.has(token)) return true;

    if (token === "cho") return false;

    if (inputLanguage === "en") {
        return token.length > 1 && !EN_STOPWORDS.has(token);
    }

    return token.length > 1 && !VI_STOPWORDS.has(token);
};

const extractStrongPhrases = (normalizedText = "") =>
    STRONG_PHRASES.filter((phrase) =>
        normalizedText.includes(normalizeText(phrase)),
    );

const inferCategoryHints = ({
    normalized,
    petType,
    discountMode,
    productForm,
}) => {
    const hints = [];

    if (normalized.includes("thuc an") || normalized.includes("food")) {
        hints.push("food");
        if (petType === "cat") hints.push("cat food");
        if (petType === "dog") hints.push("dog food");
    }

    if (normalized.includes("pate") || productForm === "pate") {
        hints.push("pate");
        if (petType === "cat") hints.push("pate cho meo");
        if (petType === "dog") hints.push("pate cho cho");
    }

    if (
        normalized.includes("hat") ||
        normalized.includes("kibble") ||
        productForm === "kibble"
    ) {
        hints.push("kibble");
        if (petType === "cat") hints.push("hat cho meo");
        if (petType === "dog") hints.push("hat cho cho");
    }

    if (
        normalized.includes("sua") ||
        normalized.includes("milk") ||
        productForm === "milk"
    ) {
        // Avoid misclassifying "sữa tắm" (shampoo) as milk.
        if (!normalized.includes("sua tam") && productForm !== "shampoo") {
            hints.push("milk");
            if (petType === "cat") hints.push("sua cho meo");
            if (petType === "dog") hints.push("sua cho cho");
        }
    }

    if (
        normalized.includes("do choi") ||
        normalized.includes("toy") ||
        productForm === "toy"
    ) {
        hints.push("toy");
        if (petType === "cat") hints.push("cat toy");
        if (petType === "dog") hints.push("dog toy");
    }

    if (normalized.includes("snack") || productForm === "snack") {
        hints.push("snack");
        if (petType === "cat") hints.push("cat snack");
        if (petType === "dog") hints.push("dog snack");
    }

    if (
        normalized.includes("shampoo") ||
        normalized.includes("sua tam") ||
        productForm === "shampoo"
    ) {
        hints.push("shampoo");
    }

    if (discountMode === "discounted") {
        hints.push("discount");
        hints.push("sale");
        hints.push("promotion");
    }

    if (discountMode === "non_discounted") {
        hints.push("gia goc");
        hints.push("full price");
    }

    return uniqueList(hints);
};

module.exports = {
    hasVietnameseDiacritics,
    tokenize,
    uniqueList,
    includesPhrase,
    buildNgrams,
    expandSynonyms,
    shouldKeepKeyword,
    extractStrongPhrases,
    inferCategoryHints,
};
