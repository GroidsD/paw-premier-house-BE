const productRepo = require("../repositories/productChatRepository");
const { mapProductRecord } = require("./productMapper");
const ranker = require("./productRanker");
const { searchProductsBySemantic } = require("./semanticSearchService");
const { mergeSemanticIntoItems } = require("./semanticMergeService");
const normalizeText = require("../../../utils/normalizeText");
const {
    SEMANTIC_INTENT_HINTS,
    BROAD_BROWSE_HINTS,
} = require("../analyzer/constants");

const searchCache = new Map();
const SEARCH_CACHE_TTL_MS = 60 * 1000;
const MAX_SEARCH_CACHE_SIZE = 200;

const isBroadBrowseQuery = ({ analysis, result, message = "" }) => {
    const normalizedMessage = normalizeText(message);

    const hasBroadTerm = BROAD_BROWSE_HINTS.some((term) =>
        normalizedMessage.includes(term),
    );

    const isSpecific =
        Boolean(analysis?.productForm) ||
        Boolean(analysis?.discountMode) ||
        Boolean(analysis?.petSize) ||
        (result?.matched_categories?.length || 0) > 0;

    return hasBroadTerm && !isSpecific;
};

const getBrowseGroupKey = (item = {}, ranker) => {
    const signals = ranker.getProductFormSignals(item);

    if (signals.pate || signals.kibble || signals.milk || signals.snack) {
        return "food";
    }

    if (signals.toy) {
        return "toy";
    }

    if (signals.shampoo) {
        return "care";
    }

    const category = normalizeText(item.category || "");

    if (
        category.includes("accessory") ||
        category.includes("accessories") ||
        category.includes("phu kien") ||
        category.includes("clothes") ||
        category.includes("quan ao") ||
        category.includes("apparel")
    ) {
        return "accessory";
    }

    return "other";
};

const diversifyItemsForBrowse = ({ items = [], limit = 4, ranker }) => {
    const grouped = new Map();

    for (const item of items) {
        const groupKey = getBrowseGroupKey(item, ranker);

        if (!grouped.has(groupKey)) {
            grouped.set(groupKey, []);
        }

        grouped.get(groupKey).push(item);
    }

    const preferredOrder = ["food", "toy", "care", "accessory", "other"];
    const diversified = [];

    // Vòng 1: mỗi group lấy 1 item tốt nhất
    for (const groupKey of preferredOrder) {
        const groupItems = grouped.get(groupKey) || [];
        if (groupItems.length > 0) {
            diversified.push(groupItems[0]);
        }
    }

    // Vòng 2: fill thêm item còn lại nếu chưa đủ
    if (diversified.length < limit) {
        const pickedIds = new Set(diversified.map((item) => item.product_id));
        const leftovers = items.filter(
            (item) => !pickedIds.has(item.product_id),
        );
        diversified.push(...leftovers.slice(0, limit - diversified.length));
    }

    return diversified.slice(0, limit);
};

const finalizeItems = ({
    items = [],
    analysis = {},
    matchedCategories = [],
    message = "",
    limit = 4,
    ranker,
}) => {
    let cleanedItems = [...items];

    // Hard guard cuối cùng theo product form
    if (analysis?.productForm) {
        cleanedItems = cleanedItems.filter((item) =>
            ranker.matchesProductForm(item, analysis.productForm),
        );
    }

    // Hard guard cuối cùng theo pet type
    if (analysis?.petType) {
        cleanedItems = cleanedItems.filter((item) =>
            ranker.belongsToPetType(item, analysis.petType),
        );
    }

    const broadBrowse = isBroadBrowseQuery({
        analysis,
        result: { matched_categories: matchedCategories },
        message,
    });

    if (broadBrowse) {
        return diversifyItemsForBrowse({
            items: cleanedItems,
            limit,
            ranker,
        });
    }

    return cleanedItems.slice(0, limit);
};

const shouldUseSemanticFallback = ({ analysis, result, message = "" }) => {
    if (!result?.items?.length) return true;
    if ((result?.confidence || 0) < 0.35) return true;

    const normalizedMessage = normalizeText(message);

    const hasSemanticHint = SEMANTIC_INTENT_HINTS.some((hint) =>
        normalizedMessage.includes(hint),
    );

    const weakStructuredSignals =
        !analysis?.productForm &&
        !analysis?.discountMode &&
        !result?.matched_categories?.length;

    return weakStructuredSignals || hasSemanticHint;
};

const buildSearchCacheKey = (analysis = {}) =>
    JSON.stringify({
        normalized: analysis?.normalized || null,
        inputLanguage: analysis?.inputLanguage || null,
        petType: analysis?.petType || null,
        petSize: analysis?.petSize || null,
        productForm: analysis?.productForm || null,
        discountMode: analysis?.discountMode || null,
    });

const getCachedSearchResult = (cacheKey) => {
    const cached = searchCache.get(cacheKey);

    if (!cached) return null;

    const isExpired = Date.now() - cached.createdAt > SEARCH_CACHE_TTL_MS;

    if (isExpired) {
        searchCache.delete(cacheKey);
        return null;
    }

    return cached.value;
};

const setCachedSearchResult = (cacheKey, value) => {
    if (searchCache.size >= MAX_SEARCH_CACHE_SIZE) {
        const oldestKey = searchCache.keys().next().value;
        if (oldestKey) {
            searchCache.delete(oldestKey);
        }
    }

    searchCache.set(cacheKey, {
        value,
        createdAt: Date.now(),
    });
};

const getQueryLimit = ({ analysis, categoryIds }) => {
    const veryStrongSignals = Boolean(
        categoryIds.length &&
        analysis?.productForm &&
        (analysis?.petSize || analysis?.discountMode || analysis?.petType),
    );

    const hasStrongSignals = Boolean(
        categoryIds.length ||
        analysis?.productForm ||
        analysis?.discountMode ||
        analysis?.petSize,
    );

    if (veryStrongSignals) {
        return 8;
    }

    if (analysis?.petType && !categoryIds.length) {
        return 10;
    }

    return hasStrongSignals ? 12 : 10;
};

const pickBasePool = ({ mapped, analysis, ranker }) => {
    const petTypeFiltered = analysis?.petType
        ? mapped.filter((item) =>
              ranker.belongsToPetType(item, analysis.petType),
          )
        : mapped;

    const formFiltered = analysis?.productForm
        ? petTypeFiltered.filter((item) =>
              ranker.matchesProductForm(item, analysis.productForm),
          )
        : petTypeFiltered;

    const discountFiltered = analysis?.discountMode
        ? formFiltered.filter((item) =>
              ranker.matchesDiscountMode(item, analysis.discountMode),
          )
        : formFiltered;

    // Nếu user đã nói rõ productForm thì không fallback broad nữa
    if (analysis?.productForm) {
        return {
            petTypeFiltered,
            formFiltered,
            discountFiltered,
            basePool:
                discountFiltered.length > 0 ? discountFiltered : formFiltered,
        };
    }

    return {
        petTypeFiltered,
        formFiltered,
        discountFiltered,
        basePool:
            discountFiltered.length > 0
                ? discountFiltered
                : formFiltered.length > 0
                  ? formFiltered
                  : petTypeFiltered.length > 0
                    ? petTypeFiltered
                    : mapped,
    };
};

const findRelevantProducts = async ({ message, analysis }) => {
    const startedAt = Date.now();
    const cacheKey = buildSearchCacheKey(analysis);
    const cachedResult = getCachedSearchResult(cacheKey);

    if (cachedResult) {
        console.log("product search timing:", {
            total: Date.now() - startedAt,
            cacheHit: true,
            finalCount: cachedResult.items?.length || 0,
            matchedCategoriesCount:
                cachedResult.matched_categories?.length || 0,
        });

        return {
            ...cachedResult,
            user_question: message,
            analysis,
        };
    }

    const t1 = Date.now();
    const categories = await productRepo.findActiveCategories();
    const matchedCategories = ranker.getMatchedCategories(analysis, categories);
    const categoryIds = matchedCategories.map(
        (category) => category.productCategories_id,
    );
    const categoriesTime = Date.now() - t1;

    const queryLimit = getQueryLimit({ analysis, categoryIds });

    const t2 = Date.now();
    const products = await productRepo.findProductCandidates({
        categoryIds,
        limit: queryLimit,
    });
    const queryTime = Date.now() - t2;

    const t3 = Date.now();
    const mapped = products
        .map((product) => mapProductRecord(product, analysis, ranker))
        .filter(Boolean);
    const mappingTime = Date.now() - t3;

    const t4 = Date.now();

    const { basePool, petTypeFiltered, formFiltered, discountFiltered } =
        pickBasePool({
            mapped,
            analysis,
            ranker,
        });

    const ranked = basePool
        .map((item) => {
            const result = ranker.scoreProduct(
                item,
                analysis,
                matchedCategories,
            );

            return {
                ...item,
                _score: result.score,
                _matched_reasons: result.matchedReasons,
            };
        })
        .sort((a, b) => b._score - a._score || b.quantity - a.quantity)
        .filter((item) => item._score > 0);

    const rankingTime = Date.now() - t4;

    const candidateItems =
        ranked.length > 0 ? ranked.slice(0, 8) : basePool.slice(0, 8);

    const finalItems = finalizeItems({
        items: candidateItems,
        analysis,
        matchedCategories: matchedCategories.map((c) => c.type),
        message,
        limit: 4,
        ranker,
    });

    const isBroad = isBroadBrowseQuery({
        analysis,
        result: { matched_categories: matchedCategories.map((c) => c.type) },
        message,
    });

    const result = {
        type: "products",
        items: finalItems,
        user_question: message,
        analysis,
        matched_categories: matchedCategories.map((category) => category.type),
        applied_filters: [
            "active_products_only",
            categoryIds.length
                ? "matched_category_prefilter"
                : "full_catalog_scan",
            analysis?.petType ? "pet_type_hard_filter" : null,
            analysis?.productForm
                ? `product_form:${analysis.productForm}`
                : null,
            analysis?.discountMode
                ? `discount_mode:${analysis.discountMode}`
                : null,
            "variant_level_matching",
            "post_ranked_search",
            analysis?.petType ? `pet_type:${analysis.petType}` : null,
            analysis?.petSize ? `pet_size:${analysis.petSize}` : null,
            isBroad ? "browse_group_diversified" : null,
        ].filter(Boolean),
        confidence: ranker.calculateConfidence(finalItems, analysis),
    };

    let finalResult = result;

    if (shouldUseSemanticFallback({ analysis, result, message })) {
        try {
            const semanticResults = await searchProductsBySemantic({
                message,
                limit: 6,
            });

            if (semanticResults.length > 0) {
                const semanticProductIds = semanticResults
                    .map((item) => Number(item.product_id))
                    .filter(Boolean);

                const semanticProducts = await productRepo.findProductsByIds({
                    productIds: semanticProductIds,
                });

                const semanticMappedItems = semanticProducts
                    .map((product) =>
                        mapProductRecord(product, analysis, ranker),
                    )
                    .filter(Boolean)
                    .filter((item) =>
                        analysis?.petType
                            ? ranker.belongsToPetType(item, analysis.petType)
                            : true,
                    )
                    .filter((item) =>
                        analysis?.productForm
                            ? ranker.matchesProductForm(
                                  item,
                                  analysis.productForm,
                              )
                            : true,
                    )
                    .map((item) => ({
                        ...item,
                        _score: Number(item._score || 5),
                    }));

                const mergedItems = mergeSemanticIntoItems({
                    localItems: finalResult.items,
                    semanticMappedItems,
                    semanticResults,
                    analysis,
                });

                const finalMergedItems = finalizeItems({
                    items: mergedItems,
                    analysis,
                    matchedCategories: finalResult.matched_categories || [],
                    message,
                    limit: 4,
                    ranker,
                });

                finalResult = {
                    ...finalResult,
                    items: finalMergedItems,
                    applied_filters: [
                        ...finalResult.applied_filters,
                        "semantic_rerank",
                        "semantic_candidate_expansion",
                        analysis?.productForm ? "post_merge_form_guard" : null,
                        isBroad ? "browse_group_diversified" : null,
                    ].filter(Boolean),
                };
            }
        } catch (error) {
            console.error("semantic fallback error:", error.message);
        }
    }

    setCachedSearchResult(cacheKey, finalResult);

    console.log("product search timing:", {
        total: Date.now() - startedAt,
        cacheHit: false,
        categoriesTime,
        queryTime,
        mappingTime,
        rankingTime,
        productsFetched: products.length,
        mappedCount: mapped.length,
        petTypeFilteredCount: petTypeFiltered.length,
        formFilteredCount: formFiltered.length,
        discountFilteredCount: discountFiltered.length,
        finalCount: finalResult.items.length,
        categoryIdsCount: categoryIds.length,
        queryLimit,
        usedSemanticFallback:
            finalResult.applied_filters.includes("semantic_rerank"),
    });

    return finalResult;
};

module.exports = {
    findRelevantProducts,
};
