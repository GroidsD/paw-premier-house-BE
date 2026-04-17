const normalizeText = require("../../utils/normalizeText");
const llmService = require("./llmService");
const { hasVietnameseDiacritics } = require("./../AI/analyzer/utils");
const { KEEP_IN_PHRASES } = require("./analyzer/constants");
const {
    tokenize,
    uniqueList,
    shouldKeepKeyword,
    buildNgrams,
    extractStrongPhrases,
    inferCategoryHints,
    expandSynonyms,
} = require("./analyzer/utils");
const {
    detectInputLanguage,
    detectPetType,
    detectPetSize,
    detectDiscountMode,
    detectProductForm,
} = require("./analyzer/detectors");

const hasContextualReference = (message = "") => {
    const text = normalizeText(message);
    if (!text) return false;

    return (
        text.includes("loai nay") ||
        text.includes("san pham nay") ||
        text.includes("cai nay") ||
        text.includes("thu nay") ||
        text.includes("mat hang nay") ||
        text.includes("sua tam nay") ||
        text.includes("pate nay") ||
        text.includes("hat nay") ||
        text.includes("do choi nay") ||
        text.includes("dich vu nay") ||
        text.includes("this one") ||
        text.includes("this product") ||
        text.includes("this item") ||
        text.includes("this service")
    );
};

const hasExplicitProductName = (message = "", productForm = null) => {
    const text = normalizeText(message);
    if (!text) return false;

    // Nếu chỉ nói dạng chung chung như "sữa tắm này", "loại này" thì KHÔNG tính là explicit
    const genericOnlyPatterns = [
        "sua tam nay",
        "loai nay",
        "san pham nay",
        "cai nay",
        "thu nay",
        "mat hang nay",
        "this one",
        "this product",
        "this item",
    ];

    if (genericOnlyPatterns.some((pattern) => text.includes(pattern))) {
        return false;
    }

    // Có form + thêm từ mô tả khác ngoài form chung chung thì xem là explicit hơn
    if (productForm === "shampoo") {
        return (
            text.includes("deodorizing") ||
            text.includes("pet shampoo") ||
            text.includes("shampoo kh") || // optional loose partial
            text.split(" ").length >= 5
        );
    }

    if (
        productForm === "pate" ||
        productForm === "kibble" ||
        productForm === "milk" ||
        productForm === "toy"
    ) {
        return text.split(" ").length >= 4 && !hasContextualReference(message);
    }

    return !hasContextualReference(message) && text.split(" ").length >= 4;
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
    const petType = detectPetType(message);
    const petSize = detectPetSize(message);
    const discountMode = detectDiscountMode(message);
    const productForm = detectProductForm(message);

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

    const contextualReference = hasContextualReference(message);
    const explicitProductName = hasExplicitProductName(message, productForm);

    console.log("deterministic signals debug:", {
        message,
        normalized,
        tokens,
        phraseTokens,
        rawKeywords,
        ngrams,
        strongPhrases,
        petType,
        petSize,
        discountMode,
        productForm,
        contextualReference,
        explicitProductName,
    });

    const resolvedLanguage =
        inputLanguage === "mixed"
            ? hasVietnameseDiacritics(message)
                ? "vi"
                : "en"
            : inputLanguage;

    return {
        raw: normalized,
        normalized,
        inputLanguage,
        language: resolvedLanguage,
        petType,
        petSize,
        discountMode,
        rawKeywords: uniqueList(rawKeywords),
        searchTerms,
        categoryHints,
        productForm,
        contextualReference,
        explicitProductName,
    };
};

const shouldUseLLMExpansion = (analysis) => {
    const raw = String(analysis?.normalized || analysis?.raw || "");

    const hasStrongStructuredSignals = Boolean(
        analysis.petType || analysis.productForm || analysis.discountMode,
    );

    if (hasStrongStructuredSignals) {
        return false;
    }

    const hasDirectAccountIntent =
        raw.includes("my orders") ||
        raw.includes("my order") ||
        raw.includes("my bookings") ||
        raw.includes("my booking") ||
        raw.includes("my reservation") ||
        raw.includes("my reservations") ||
        raw.includes("order history") ||
        raw.includes("purchase history") ||
        raw.includes("don hang cua toi") ||
        raw.includes("order cua toi") ||
        raw.includes("orders cua toi") ||
        raw.includes("booking cua toi") ||
        raw.includes("lich hen cua toi") ||
        raw.includes("booking cua minh");

    if (hasDirectAccountIntent) {
        return false;
    }

    const hasClearCommerceSignals =
        raw.includes("gia bao nhieu") ||
        raw.includes("bao nhieu tien") ||
        raw.includes("con hang") ||
        raw.includes("het hang") ||
        raw.includes("giam gia") ||
        raw.includes("khuyen mai") ||
        raw.includes("dang sale") ||
        raw.includes("price") ||
        raw.includes("stock") ||
        raw.includes("available") ||
        raw.includes("discount") ||
        raw.includes("sale");

    if (hasClearCommerceSignals) {
        return false;
    }

    const tooFewTerms = analysis.searchTerms.length < 3;
    const foreignLanguageWeak =
        ["en", "mixed"].includes(analysis.inputLanguage) &&
        analysis.searchTerms.length < 5;

    return tooFewTerms || foreignLanguageWeak;
};

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
    contextualReference:
        typeof extra.contextualReference === "boolean"
            ? extra.contextualReference
            : base.contextualReference,
    explicitProductName:
        typeof extra.explicitProductName === "boolean"
            ? extra.explicitProductName
            : base.explicitProductName,
});

const analyzeMessage = async (message = "") => {
    const startedAt = Date.now();
    const deterministic = extractDeterministicSignals(message);
    let merged = deterministic;
    let usedLLMExpansion = false;

    if (shouldUseLLMExpansion(deterministic)) {
        usedLLMExpansion = true;
        const llmSignals = await llmService.expandSearchSignals({
            message,
            language: deterministic.language,
        });
        merged = mergeSignals(deterministic, llmSignals || {});
    }

    const result = {
        ...merged,
        searchTerms: uniqueList(merged.searchTerms),
        categoryHints: uniqueList(merged.categoryHints),
    };

    console.log("analyze timing:", {
        duration: Date.now() - startedAt,
        usedLLMExpansion,
        inputLanguage: result.inputLanguage,
        petType: result.petType,
        productForm: result.productForm,
        discountMode: result.discountMode,
        contextualReference: result.contextualReference,
        explicitProductName: result.explicitProductName,
        searchTermsCount: result.searchTerms.length,
    });

    return result;
};

module.exports = analyzeMessage;
