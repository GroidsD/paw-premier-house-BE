const productRepo = require("../repositories/productChatRepository");
const { mapProductRecord } = require("./productMapper");
const ranker = require("./productRanker");

const findRelevantProducts = async ({ message, analysis }) => {
    const startedAt = Date.now();

    if (
        analysis?.needsDisambiguation &&
        analysis?.semanticIsAmbiguous &&
        analysis?.semanticGroupedMatches
    ) {
        const foodIds = (analysis.semanticGroupedMatches.food || [])
            .map((x) => x.product_id)
            .filter(Boolean);

        const hygieneIds = (analysis.semanticGroupedMatches.hygiene_care || [])
            .map((x) => x.product_id)
            .filter(Boolean);

        const groupedIds = [...new Set([...foodIds, ...hygieneIds])];

        const categories = await productRepo.findActiveCategories();
        const products = await productRepo.findProductCandidates({
            categoryIds: [],
            limit: 24,
        });

        const mapped = products
            .map((product) => mapProductRecord(product, analysis, ranker))
            .filter(Boolean);

        const groupedItems = mapped.filter((item) =>
            groupedIds.includes(item.product_id),
        );

        return {
            type: "products",
            items: groupedItems.slice(0, 6),
            total_matched: groupedItems.length,
            user_question: message,
            analysis,
            matched_categories: [],
            applied_filters: ["semantic_ambiguous_grouped"],
            confidence: analysis?.semanticConfidence || 0.6,
            failure_reason: "needs_disambiguation",
            answer_mode: "db_strict",
            answer_mode_reason: "semantic ambiguous grouped intent",
        };
    }
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

    const petTypeFiltered =
        analysis?.petType && !ranker.shouldSkipPetTypeFilter(analysis)
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

    let basePool;
    let hardFormConstraintFailed = false;

    if (analysis?.productForm === "shampoo") {
        console.log(
            "shampoo candidates debug:",
            mapped.slice(0, 10).map((item) => ({
                id: item.product_id,
                name: item.name,
                category: item.category,
                description: item.description,
                formMatch: ranker.matchesProductForm(item, "shampoo"),
            })),
        );
    }

    if (analysis?.productForm) {
        if (discountFiltered.length > 0) {
            basePool = discountFiltered;
        } else if (formFiltered.length > 0) {
            basePool = formFiltered;
        } else {
            basePool = [];
            hardFormConstraintFailed = true;
        }
    } else {
        basePool =
            discountFiltered.length > 0
                ? discountFiltered
                : formFiltered.length > 0
                  ? formFiltered
                  : petTypeFiltered.length > 0
                    ? petTypeFiltered
                    : mapped;
    }

    const priceFilter = analysis?.priceFilter || null;

    const priceFiltered = priceFilter
        ? basePool.filter((item) =>
              ranker.matchesPriceFilter(item, priceFilter),
          )
        : basePool;

    const rankingPool =
        priceFilter && priceFiltered.length > 0 ? priceFiltered : basePool;

    const priceFilterFallbackUsed =
        Boolean(priceFilter) &&
        priceFiltered.length === 0 &&
        basePool.length > 0;

    const ranked = rankingPool
        .map((item) => {
            const result = ranker.scoreProduct(
                item,
                analysis,
                matchedCategories,
            );

            const priceDistance = ranker.getPriceDistance(
                item,
                analysis?.priceFilter || null,
            );

            return {
                ...item,
                _score: result.score,
                _price_distance: priceDistance,
                _matched_reasons: [
                    ...result.matchedReasons,
                    analysis?.priceFilter
                        ? priceFilterFallbackUsed
                            ? "price_nearest_fallback"
                            : "price_filter"
                        : null,
                ].filter(Boolean),
            };
        })
        .sort(
            (a, b) =>
                b._score - a._score ||
                a._price_distance - b._price_distance ||
                b.quantity - a.quantity,
        )
        .filter((item) => item._score > 0);

    const rankingTime = Date.now() - t4;

    let finalItems = [];
    if (ranked.length > 0) {
        finalItems = ranked.slice(0, 4);
    } else if (!analysis?.productForm) {
        finalItems = basePool.slice(0, 4);
    }

    // NEW: tổng số item match thật trước khi slice card
    const totalMatched =
        ranked.length > 0
            ? ranked.length
            : !analysis?.productForm
              ? basePool.length
              : 0;

    const baseConfidence = hardFormConstraintFailed
        ? 0
        : ranker.calculateConfidence(finalItems, analysis);

    const isBroadBrowsePetQuery =
        !analysis?.productForm &&
        !analysis?.discountMode &&
        Boolean(analysis?.petType) &&
        finalItems.length > 0;

    const isDiscountBrowseQuery =
        !analysis?.productForm &&
        analysis?.discountMode === "discounted" &&
        finalItems.length > 0;

    const adjustedConfidence = isBroadBrowsePetQuery
        ? Math.max(baseConfidence, finalItems.length >= 3 ? 0.68 : 0.58)
        : isDiscountBrowseQuery
          ? Math.max(baseConfidence, finalItems.length >= 3 ? 0.66 : 0.56)
          : baseConfidence;

    console.log("product search timing:", {
        total: Date.now() - startedAt,
        categoriesTime,
        queryTime,
        mappingTime,
        rankingTime,
        productsFetched: products.length,
        mappedCount: mapped.length,
        finalCount: finalItems.length,
        totalMatched,
        categoryIdsCount: categoryIds.length,
        hardFormConstraintFailed,
    });

    return {
        type: "products",
        items: finalItems,
        total_matched: totalMatched, // NEW
        user_question: message,
        analysis,
        matched_categories: matchedCategories.map((category) =>
            analysis?.language === "en"
                ? category.type_en || category.type_vi
                : category.type_vi
        ),
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
            analysis?.productForm && hardFormConstraintFailed
                ? "product_form_no_match"
                : null,
            "variant_level_matching",
            "post_ranked_search",
            analysis?.petType ? `pet_type:${analysis.petType}` : null,
        ].filter(Boolean),
        confidence: adjustedConfidence,
        failure_reason: hardFormConstraintFailed
            ? "product_form_no_match"
            : null,
        answer_mode: "db_strict",
        answer_mode_reason: "structured commerce intent",
    };
};

module.exports = {
    findRelevantProducts,
};
