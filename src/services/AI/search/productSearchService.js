const productRepo = require("../repositories/productChatRepository");
const { mapProductRecord } = require("./productMapper");
const ranker = require("./productRanker");
const findRelevantProducts = async ({ message, analysis }) => {
    const startedAt = Date.now();

    const t1 = Date.now();
    const categories = await productRepo.findActiveCategories();
    const matchedCategories = ranker.getMatchedCategories(analysis, categories);
    const categoryIds = matchedCategories.map(
        (category) => category.productCategories_id,
    );
    const categoriesTime = Date.now() - t1;

    const t2 = Date.now();
    const products = await productRepo.findProductCandidates({
        categoryIds,
        limit: categoryIds.length ? 24 : 16,
    });
    const queryTime = Date.now() - t2;

    const t3 = Date.now();
    const mapped = products
        .map((product) => mapProductRecord(product, analysis, ranker))
        .filter(Boolean);
    const mappingTime = Date.now() - t3;

    const t4 = Date.now();
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

    const basePool =
        discountFiltered.length > 0
            ? discountFiltered
            : formFiltered.length > 0
              ? formFiltered
              : petTypeFiltered.length > 0
                ? petTypeFiltered
                : mapped;

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

    console.log("product search timing:", {
        total: Date.now() - startedAt,
        categoriesTime,
        queryTime,
        mappingTime,
        rankingTime,
        productsFetched: products.length,
        mappedCount: mapped.length,
        finalCount: finalItems.length,
        categoryIdsCount: categoryIds.length,
    });

    return {
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
};
module.exports = {
    findRelevantProducts,
};
