const normalizeText = require("../../../utils/normalizeText");
const { hasVietnameseDiacritics, includesPhrase } = require("./utils");
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

const detectPetType = (text = "") => {
    const normalized = normalizeText(text);

    const catMatches = PET_TYPE_PATTERNS.cat.filter((keyword) =>
        normalized.includes(normalizeText(keyword)),
    );

    const dogMatches = PET_TYPE_PATTERNS.dog.filter((keyword) =>
        normalized.includes(normalizeText(keyword)),
    );

    if (catMatches.length > 0 && dogMatches.length === 0) return "cat";
    if (dogMatches.length > 0 && catMatches.length === 0) return "dog";

    const longestCat = Math.max(0, ...catMatches.map((item) => item.length));
    const longestDog = Math.max(0, ...dogMatches.map((item) => item.length));

    if (longestCat > longestDog) return "cat";
    if (longestDog > longestCat) return "dog";

    return null;
};

const detectPetSize = (text = "") => {
    if (includesPhrase(text, PET_SIZE_KEYWORDS.small)) return "small";
    if (includesPhrase(text, PET_SIZE_KEYWORDS.medium)) return "medium";
    if (includesPhrase(text, PET_SIZE_KEYWORDS.large)) return "large";
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

    const matchedForms = Object.entries(PRODUCT_FORM_KEYWORDS)
        .filter(([, keywords]) =>
            keywords.some((keyword) =>
                normalized.includes(normalizeText(keyword)),
            ),
        )
        .map(([form]) => form);

    if (!matchedForms.length) return null;

    const priority = ["pate", "kibble", "milk", "toy", "snack", "shampoo"];
    return (
        priority.find((item) => matchedForms.includes(item)) || matchedForms[0]
    );
};

module.exports = {
    detectInputLanguage,
    detectPetType,
    detectPetSize,
    detectDiscountMode,
    detectProductForm,
};
