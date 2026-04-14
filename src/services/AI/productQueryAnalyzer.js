const normalizeText = require("../../utils/normalizeText");
const llmService = require("./llmService");
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
    });

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

const shouldUseLLMExpansion = (analysis) => {
    const hasStrongStructuredSignals = Boolean(
        analysis.petType || analysis.productForm || analysis.discountMode,
    );

    if (hasStrongStructuredSignals) {
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
        searchTermsCount: result.searchTerms.length,
    });

    return result;
};

module.exports = analyzeMessage;
