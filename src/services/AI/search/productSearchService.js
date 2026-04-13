const productRepo = require("../repositories/productChatRepository");
const { mapProductRecord } = require("./productMapper");
const ranker = require("./productRanker");

const searchCache = new Map();
const SEARCH_CACHE_TTL_MS = 60 * 1000;

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

const MAX_SEARCH_CACHE_SIZE = 200;

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

    const finalItems =
        ranked.length > 0 ? ranked.slice(0, 4) : basePool.slice(0, 4);

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
        ].filter(Boolean),
        confidence: ranker.calculateConfidence(finalItems, analysis),
    };

    setCachedSearchResult(cacheKey, result);

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
        finalCount: finalItems.length,
        categoryIdsCount: categoryIds.length,
        queryLimit,
    });

    return result;
};

module.exports = {
    findRelevantProducts,
};
