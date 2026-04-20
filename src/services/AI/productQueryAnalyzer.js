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

    // Không có productForm thì tuyệt đối không tự suy ra explicit product name
    if (!productForm) {
        return false;
    }

    // Nếu là query kiểu browse/search chung thì không phải explicit name
    const broadSearchPatterns = [
        "shop co",
        "shop ban co",
        "co loai nao",
        "co ban khong",
        "gia bao nhieu",
        "bao nhieu tien",
        "con hang",
        "het hang",
        "co san khong",
        "co hang khong",
        "nen an gi",
        "cho an nhu the nao",
        "feeding guide",
        "omega 3",
        "vitamin",
        "protein",
        "dinh duong",
        "che do an",
        "do choi cho cho",
        "do choi cho meo",
        "pate cho meo",
        "pate cho cho",
        "hat cho meo",
        "hat cho cho",
        "sua cho meo",
        "sua cho cho",
    ];

    // Với shampoo: chỉ xem là explicit khi có cụm tên tương đối rõ
    if (productForm === "shampoo") {
        if (
            text.includes("deodorizing pet shampoo") ||
            text.includes("pet shampoo deodorizing")
        ) {
            return true;
        }

        if (broadSearchPatterns.some((pattern) => text.includes(pattern))) {
            return false;
        }

        return false;
    }

    // Với các form khác: chỉ explicit khi có form + câu không phải query chung
    if (["pate", "kibble", "milk", "toy", "snack"].includes(productForm)) {
        if (broadSearchPatterns.some((pattern) => text.includes(pattern))) {
            return false;
        }

        return text.split(" ").length >= 4 && !hasContextualReference(message);
    }

    return false;
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

    // Fix 4: Cải thiện language resolution cho mixed/no-diacritics input
    // Trường hợp cũ: "omega 3 cho meo tot khong" (gõ không dấu) → mixed → không có dấu → "en" ❌
    // Trường hợp mới: đếm tỉ lệ VI/EN tokens để quyết định chính xác hơn
    const resolvedLanguage = (() => {
        if (inputLanguage === "vi") return "vi";
        if (inputLanguage === "en") return "en";

        // mixed: ưu tiên dấu tiếng Việt trước
        if (hasVietnameseDiacritics(message)) return "vi";

        // Không có dấu: đếm VI domain tokens vs EN domain tokens
        const {
            VI_STOPWORDS,
            VI_DOMAIN_KEYWORDS,
            EN_STOPWORDS,
            EN_DOMAIN_KEYWORDS,
        } = require("./analyzer/constants");

        const viCount = tokens.filter(
            (t) => VI_STOPWORDS.has(t) || VI_DOMAIN_KEYWORDS.has(t),
        ).length;
        const enCount = tokens.filter(
            (t) => EN_STOPWORDS.has(t) || EN_DOMAIN_KEYWORDS.has(t),
        ).length;

        // Ưu tiên vi nếu bằng nhau (vì app chủ yếu là người Việt)
        return viCount >= enCount ? "vi" : "en";
    })();

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
    const obviousSmallTalk =
        raw === "hello" ||
        raw === "hello shop" ||
        raw === "hi" ||
        raw === "hey" ||
        raw === "alo" ||
        raw === "xin chao" ||
        raw === "chao shop";

    if (obviousSmallTalk) {
        return false;
    }
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
