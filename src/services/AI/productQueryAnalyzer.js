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
    "nay",
    "kia",
    "cua",
    "de",
    "mot",
    "nhung",
    "loai",
    "nao",
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
    "some",
    "any",
]);

const VI_DOMAIN_KEYWORDS = new Set([
    "meo",
    "cun",
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
    "grooming",
    "spa",
    "giam",
    "gia",
    "khuyen",
    "mai",
    "sale",
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
    "accessories",
    "clothes",
    "grooming",
    "dental",
    "care",
    "oral",
    "kibble",
    "pate",
    "discount",
    "sale",
    "deal",
    "promotion",
    "milk",
    "wet",
]);

const PET_TYPE_PATTERNS = {
    dog: [
        "cho con",
        "cun",
        "cun con",
        "dog",
        "dogs",
        "puppy",
        "puppies",
        "dog food",
        "dog snack",
        "dog toy",
        "thuc an cho cho",
        "do an cho cho",
        "pate cho cho",
        "sua cho cho",
    ],
    cat: [
        "meo",
        "meo con",
        "boss",
        "cat",
        "cats",
        "kitten",
        "kittens",
        "cat food",
        "cat snack",
        "cat toy",
        "thuc an cho meo",
        "do an cho meo",
        "pate cho meo",
        "sua cho meo",
    ],
};

const PET_SIZE_KEYWORDS = {
    small: ["nho", "mini", "be", "size s", "small", "tiny"],
    medium: ["vua", "size m", "medium"],
    large: ["lon", "to", "size l", "large", "big"],
};

const PRODUCT_FORM_KEYWORDS = {
    pate: [
        "pate",
        "wet food",
        "cat pate",
        "dog pate",
        "pate cho meo",
        "pate cho cho",
    ],
    kibble: ["hat", "kibble", "dry food", "hat cho meo", "hat cho cho"],
    milk: [
        "sua",
        "milk",
        "kitten milk",
        "puppy milk",
        "sua cho meo",
        "sua cho cho",
    ],
    toy: ["do choi", "toy", "toys", "cat toy", "dog toy"],
    snack: ["snack", "treat", "treats", "banh thuong", "thuong"],
    shampoo: ["sua tam", "shampoo", "bath", "cleaning"],
};

const DISCOUNT_KEYWORDS = [
    "giam gia",
    "khuyen mai",
    "sale",
    "dang sale",
    "uu dai",
    "gia tot",
    "discount",
    "discounted",
    "deal",
    "promotion",
    "promo",
];

const NON_DISCOUNT_KEYWORDS = [
    "khong giam gia",
    "khong sale",
    "khong khuyen mai",
    "khong uu dai",
    "gia goc",
    "nguyen gia",
    "full price",
    "not discounted",
    "without discount",
    "non discount",
    "non discounted",
];

const DOMAIN_SYNONYMS = {
    "thuc an": ["food", "kibble", "meal", "nutrition"],
    "thuc an cho meo": [
        "cat food",
        "kitten food",
        "pate cho meo",
        "hat cho meo",
    ],
    "thuc an cho cho": [
        "dog food",
        "puppy food",
        "pate cho cho",
        "hat cho cho",
    ],
    "do an cho meo": ["cat food", "snack cho meo", "pate cho meo"],
    "do an cho cho": ["dog food", "snack cho cho", "pate cho cho"],
    "hat cho meo": ["cat food", "kibble", "thuc an cho meo"],
    "hat cho cho": ["dog food", "kibble", "thuc an cho cho"],
    "pate cho meo": ["cat food", "wet food", "thuc an cho meo"],
    "pate cho cho": ["dog food", "wet food", "thuc an cho cho"],
    "sua cho meo": ["kitten milk", "cat milk", "meo con"],
    "sua cho cho": ["puppy milk", "dog milk", "cho con"],

    food: ["thuc an", "hat", "pate", "snack"],
    "cat food": ["thuc an cho meo", "hat cho meo", "pate cho meo"],
    "dog food": ["thuc an cho cho", "hat cho cho", "pate cho cho"],

    "do choi": ["toy", "toys", "ball", "chew"],
    toy: ["do choi", "bong", "xuong nhai"],
    "cat toy": ["do choi cho meo"],
    "dog toy": ["do choi cho cho"],

    "phu kien": ["accessory", "accessories", "gear"],
    accessory: ["phu kien", "do dung"],

    "quan ao": ["clothes", "clothing", "apparel", "outfit"],
    clothes: ["quan ao", "trang phuc"],

    shampoo: ["sua tam", "tam", "ve sinh"],
    "sua tam": ["shampoo", "bath", "cleaning"],

    "dental care": ["cham soc rang mieng", "ve sinh rang mieng", "oral care"],
    "oral care": ["dental care", "cham soc rang mieng", "ve sinh rang mieng"],

    "giam gia": ["sale", "discount", "deal", "promotion"],
    "khuyen mai": ["sale", "discount", "promotion"],
    sale: ["giam gia", "khuyen mai", "discount", "deal"],
    discount: ["giam gia", "khuyen mai", "sale"],
};

const KEEP_IN_PHRASES = new Set(["meo", "dog", "cat", "cun"]);

const STRONG_PHRASES = [
    "thuc an cho meo",
    "thuc an cho cho",
    "do an cho meo",
    "do an cho cho",
    "hat cho meo",
    "hat cho cho",
    "pate cho meo",
    "pate cho cho",
    "sua cho meo",
    "sua cho cho",
    "cat food",
    "dog food",
    "kitten milk",
    "puppy milk",
    "cat toy",
    "dog toy",
    "giam gia",
    "khuyen mai",
    "khong giam gia",
    "khong sale",
    "gia goc",
];

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
        hints.push("milk");
        if (petType === "cat") hints.push("sua cho meo");
        if (petType === "dog") hints.push("sua cho cho");
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

    const rawKeywords = phraseTokens.filter(
        (token) => !KEEP_IN_PHRASES.has(token),
    );

    const ngrams = buildNgrams(phraseTokens);
    const strongPhrases = extractStrongPhrases(normalized);
    const petType = detectPetType(normalized);
    const petSize = detectPetSize(normalized);
    const discountMode = detectDiscountMode(normalized);
    const productForm = detectProductForm(normalized);

    const inferredHints = inferCategoryHints({
        normalized,
        petType,
        discountMode,
        productForm,
    });

    const baseTerms = [
        ...rawKeywords,
        ...ngrams,
        ...strongPhrases,
        ...inferredHints,
        ...(productForm ? [productForm] : []),
    ];

    const searchTerms = expandSynonyms(baseTerms);

    const categoryHints = uniqueList(
        [
            ...ngrams,
            ...rawKeywords,
            ...strongPhrases,
            ...inferredHints,
            ...(productForm ? [productForm] : []),
        ].filter((term) => term.length >= 3),
    );

    return {
        raw: normalized,
        normalized,
        inputLanguage,
        language: inputLanguage === "mixed" ? "vi" : inputLanguage,
        petType,
        petSize,
        discountMode,
        rawKeywords: uniqueList(rawKeywords),
        searchTerms,
        categoryHints,
        productForm,
    };
};

const shouldUseLLMExpansion = (analysis) =>
    analysis.inputLanguage !== "vi" ||
    analysis.searchTerms.length < 4 ||
    (!analysis.petType && !analysis.discountMode && !analysis.productForm);

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
    productForm: extra.productForm || base.productForm,
    discountMode:
        extra.discountMode === "discounted" ||
        extra.discountMode === "non_discounted"
            ? extra.discountMode
            : base.discountMode,
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
