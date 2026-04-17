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
const detectors = require("./analyzer/detectors");
const {
    detectInputLanguage,
    detectPetType,
    detectPetSize,
    detectDiscountMode,
    detectProductForm,
    detectMaxPrice,
} = detectors;

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
    const maxPrice = detectMaxPrice(message);

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

    const resolvedLanguage =
        inputLanguage === "mixed"
            ? hasVietnameseDiacritics(message)
                ? "vi"
                : "en"
            : inputLanguage;
    return {
        raw: message,
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
        maxPrice,
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
});

const analyzeMessage = async (message = "", history = []) => {
    const startedAt = Date.now();
    const deterministic = extractDeterministicSignals(message);
    let merged = { ...deterministic };

    // Inherit from history if current is missing signals
    if (history && history.length > 0) {
        // Walk backwards through history to find the most recent values for missing signals
        for (let i = history.length - 1; i >= 0; i--) {
            const turn = history[i];
            if (turn.role !== "user") continue;

            const pastSignals = extractDeterministicSignals(turn.content || "");

            if (!merged.petType && pastSignals.petType) {
                merged.petType = pastSignals.petType;
            }
            if (!merged.productForm && pastSignals.productForm) {
                merged.productForm = pastSignals.productForm;
            }
            if (!merged.discountMode && pastSignals.discountMode) {
                merged.discountMode = pastSignals.discountMode;
            }

            // If we found everything, we can stop
            if (
                merged.petType &&
                merged.productForm &&
                merged.discountMode
            ) {
                break;
            }
        }
    }

    let usedLLMExpansion = false;

    if (shouldUseLLMExpansion(merged)) {
        usedLLMExpansion = true;
        const llmSignals = await llmService.expandSearchSignals({
            message,
            language: deterministic.language,
        });
        merged = mergeSignals(merged, llmSignals || {});
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
        searchTermsCount: result.searchTerms.length,
    });

    return result;
};

module.exports = analyzeMessage;
