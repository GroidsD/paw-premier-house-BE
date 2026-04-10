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
