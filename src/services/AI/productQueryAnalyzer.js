const normalizeText = require("../../utils/normalizeText");
const llmService = require("./llmService");

const VI_STOPWORDS = new Set([
    "toi",
    "minh",
    "la",
    "va",
    "voi",
    "nhe",
    "giup",
    "can",
    "muon",
    "tim",
    "xem",
    "hoi",
    "co",
    "khong",
    "nay",
    "kia",
    "cua",
    "de",
    "mot",
    "nhung",
]);

const EN_STOPWORDS = new Set([
    "i",
    "me",
    "my",
    "the",
    "a",
    "an",
    "and",
    "or",
    "for",
    "with",
    "to",
    "of",
    "please",
    "need",
    "want",
    "show",
    "find",
    "looking",
    "search",
]);

const VI_DOMAIN_KEYWORDS = new Set([
    "cho",
    "meo",
    "thuc",
    "an",
    "hat",
    "pate",
    "sua",
    "tam",
    "do",
    "choi",
    "phu",
    "kien",
    "san",
    "pham",
    "dich",
    "vu",
    "goi",
    "y",
    "de",
    "xuat",
    "dat",
    "lich",
    "quan",
    "ao",
    "rang",
    "mieng",
]);

const EN_DOMAIN_KEYWORDS = new Set([
    "dog",
    "dogs",
    "cat",
    "cats",
    "food",
    "toy",
    "toys",
    "product",
    "products",
    "service",
    "services",
    "booking",
    "hotel",
    "training",
    "spa",
    "shampoo",
    "snack",
    "accessory",
    "clothes",
    "grooming",
    "dental",
    "care",
    "oral",
]);

const PET_TYPE_KEYWORDS = {
    dog: ["cho", "cho con", "cun", "cun con", "dog", "dogs", "puppy"],
    cat: ["meo", "boss", "cat", "cats", "kitten"],
};

const PET_SIZE_KEYWORDS = {
    small: ["nho", "mini", "be", "size s", "small", "tiny"],
    medium: ["vua", "size m", "medium"],
    large: ["lon", "to", "size l", "large", "big"],
};

const DOMAIN_SYNONYMS = {
    "thuc an": ["food", "kibble", "meal", "nutrition"],
    food: ["thuc an", "hat", "pate", "snack"],
    "do choi": ["toy", "toys", "ball", "chew"],
    toy: ["do choi", "bong", "xuong nhai"],
    "phu kien": ["accessory", "accessories", "gear"],
    accessory: ["phu kien", "do dung"],
    "quan ao": ["clothes", "clothing", "apparel", "outfit"],
    clothes: ["quan ao", "trang phuc"],
    shampoo: ["sua tam", "tam", "ve sinh"],
    "sua tam": ["shampoo", "bath", "cleaning"],
    "dental care": ["cham soc rang mieng", "ve sinh rang mieng", "oral care"],
    "oral care": ["dental care", "cham soc rang mieng", "ve sinh rang mieng"],
};

const KEEP_IN_PHRASES = new Set(["cho", "meo", "dog", "cat"]);

const hasVietnameseDiacritics = (text = "") => /[^\u0000-\u007f]/.test(text);

const tokenize = (text = "") =>
    text
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);

const uniqueList = (items = []) =>
    Array.from(
        new Set(
            items
                .map((item) => String(item || "").trim())
                .filter(Boolean),
        ),
    );

const includesPhrase = (text, keywords = []) =>
    keywords.find((keyword) => text.includes(normalizeText(keyword))) || null;

const buildNgrams = (tokens = [], maxSize = 3) => {
    const ngrams = [];

    for (let size = 2; size <= maxSize; size += 1) {
        for (let index = 0; index <= tokens.length - size; index += 1) {
            ngrams.push(tokens.slice(index, index + size).join(" "));
        }
    }

    return ngrams;
};

const detectInputLanguage = ({ message, tokens }) => {
    const viScore =
        tokens.filter((token) => VI_STOPWORDS.has(token)).length +
        tokens.filter((token) => VI_DOMAIN_KEYWORDS.has(token)).length +
        (hasVietnameseDiacritics(message) ? 3 : 0);
    const enScore =
        tokens.filter((token) => EN_STOPWORDS.has(token)).length +
        tokens.filter((token) => EN_DOMAIN_KEYWORDS.has(token)).length +
        tokens.filter((token) => /^[a-z]+$/.test(token)).length * 0.05;

    if (viScore > enScore + 1) {
        return "vi";
    }

    if (enScore > viScore + 1) {
        return "en";
    }

    return "mixed";
};

const detectPetType = (text) => {
    if (includesPhrase(text, PET_TYPE_KEYWORDS.dog)) return "dog";
    if (includesPhrase(text, PET_TYPE_KEYWORDS.cat)) return "cat";
    return null;
};

const detectPetSize = (text) => {
    if (includesPhrase(text, PET_SIZE_KEYWORDS.small)) return "small";
    if (includesPhrase(text, PET_SIZE_KEYWORDS.medium)) return "medium";
    if (includesPhrase(text, PET_SIZE_KEYWORDS.large)) return "large";
    return null;
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

    if (inputLanguage === "en") {
        return token.length > 1 && !EN_STOPWORDS.has(token);
    }

    return token.length > 1 && !VI_STOPWORDS.has(token);
};

const extractDeterministicSignals = (message = "") => {
    const normalized = normalizeText(message);
    const tokens = tokenize(normalized);
    const inputLanguage = detectInputLanguage({
        message,
        tokens,
    });
    const phraseTokens = tokens.filter((token) =>
        shouldKeepKeyword(token, inputLanguage),
    );
    const rawKeywords = phraseTokens.filter((token) => !KEEP_IN_PHRASES.has(token));
    const ngrams = buildNgrams(phraseTokens);
    const petType = detectPetType(normalized);
    const petSize = detectPetSize(normalized);
    const searchTerms = expandSynonyms([...rawKeywords, ...ngrams]);
    const categoryHints = uniqueList(
        [...ngrams, ...rawKeywords].filter((term) => term.length >= 3),
    );

    return {
        raw: normalized,
        normalized,
        inputLanguage,
        language: inputLanguage === "mixed" ? "vi" : inputLanguage,
        petType,
        petSize,
        rawKeywords: uniqueList(rawKeywords),
        searchTerms,
        categoryHints,
    };
};

const shouldUseLLMExpansion = (analysis) =>
    analysis.inputLanguage !== "vi" || analysis.searchTerms.length < 3;

const mergeSignals = (base, extra = {}) => ({
    ...base,
    language:
        extra.language === "en" || extra.language === "vi"
            ? extra.language
            : base.language,
    inputLanguage:
        extra.inputLanguage === "en" ||
        extra.inputLanguage === "vi" ||
        extra.inputLanguage === "mixed"
            ? extra.inputLanguage
            : base.inputLanguage,
    petType: extra.petType || base.petType,
    petSize: extra.petSize || base.petSize,
    rawKeywords: uniqueList(base.rawKeywords),
    searchTerms: uniqueList([
        ...base.searchTerms,
        ...(extra.searchTerms || []),
    ]),
    categoryHints: uniqueList([
        ...base.categoryHints,
        ...(extra.categoryHints || []),
    ]),
});

const analyzeMessage = async (message = "") => {
    const deterministic = extractDeterministicSignals(message);
    let merged = deterministic;

    if (shouldUseLLMExpansion(deterministic)) {
        const llmSignals = await llmService.expandSearchSignals({
            message,
            language: deterministic.language,
        });
        merged = mergeSignals(deterministic, llmSignals || {});
    }

    return {
        ...merged,
        searchTerms: uniqueList(merged.searchTerms),
        categoryHints: uniqueList(merged.categoryHints),
    };
};

module.exports = analyzeMessage;
