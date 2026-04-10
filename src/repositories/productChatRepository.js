const { Op } = require("sequelize");
const {
    Product,
    ProductCategory,
    ProductVariant,
    Media,
} = require("../models");
const normalizeText = require("../utils/normalizeText");

const normalizeTerm = (value = "") => normalizeText(String(value || ""));

const includesTerm = (haystack = "", term = "") => {
    const normalizedHaystack = normalizeTerm(haystack);
    const normalizedTerm = normalizeTerm(term);

    if (!normalizedTerm || normalizedTerm.length < 2) return false;

    return normalizedHaystack.includes(normalizedTerm);
};

const isVariantDiscounted = (variant = {}) =>
    Number(variant.original_price || 0) > Number(variant.price || 0);

const isProductBaseDiscounted = (product = {}) =>
    Number(product.original_price || 0) > Number(product.price || 0);

const hasDiscount = (product = {}) => {
    if (isProductBaseDiscounted(product)) return true;

    return (product.variants || []).some((variant) =>
        isVariantDiscounted(variant),
    );
};

const getDiscountState = (product = {}) => {
    const variants = product.variants || [];

    if (!product.has_variants || variants.length === 0) {
        const discounted = isProductBaseDiscounted(product);

        return {
            has_discounted: discounted,
            has_non_discounted: !discounted,
            mixed: false,
        };
    }

    const discountedCount = variants.filter((variant) =>
        isVariantDiscounted(variant),
    ).length;

    const nonDiscountedCount = variants.length - discountedCount;

    return {
        has_discounted: discountedCount > 0,
        has_non_discounted: nonDiscountedCount > 0,
        mixed: discountedCount > 0 && nonDiscountedCount > 0,
    };
};

const matchVariantByPetSize = (variant, petSize) => {
    const text = normalizeTerm(
        `${variant.variant_label || ""} ${variant.size || ""} ${variant.pet_weight || ""}`,
    );

    if (!petSize) return true;

    if (petSize === "small") {
        return (
            text.includes("small") ||
            text.includes("mini") ||
            text.includes("size s") ||
            text.includes("1-3kg") ||
            text.includes("1-4kg") ||
            text.includes("1-5kg") ||
            text.includes("duoi 5kg")
        );
    }

    if (petSize === "medium") {
        return (
            text.includes("medium") ||
            text.includes("size m") ||
            text.includes("5-10kg") ||
            text.includes("4-8kg")
        );
    }

    if (petSize === "large") {
        return (
            text.includes("large") ||
            text.includes("size l") ||
            text.includes("10-20kg") ||
            text.includes("8kg+")
        );
    }

    return true;
};

const filterVariantsByAnalysis = (variants = [], analysis = {}) => {
    let filtered = [...variants];

    if (analysis?.petSize) {
        filtered = filtered.filter((variant) =>
            matchVariantByPetSize(variant, analysis.petSize),
        );
    }

    if (analysis?.discountMode === "discounted") {
        filtered = filtered.filter((variant) => isVariantDiscounted(variant));
    }

    if (analysis?.discountMode === "non_discounted") {
        filtered = filtered.filter((variant) => !isVariantDiscounted(variant));
    }

    return filtered;
};

const matchesDiscountMode = (product = {}, discountMode = null) => {
    if (!discountMode) return true;

    const variants = product.variants || [];

    if (!product.has_variants || variants.length === 0) {
        const discounted = isProductBaseDiscounted(product);

        if (discountMode === "discounted") return discounted;
        if (discountMode === "non_discounted") return !discounted;
        return true;
    }

    const matchedVariants = filterVariantsByAnalysis(variants, {
        ...product.analysis,
        discountMode,
    });

    return matchedVariants.length > 0;
};

const categoryBelongsToPetType = (categoryName = "", petType = null) => {
    if (!petType) return true;

    const category = normalizeTerm(categoryName);

    if (petType === "cat") {
        if (category.includes("dog") || category.includes("cho")) return false;
    }

    if (petType === "dog") {
        if (category.includes("cat") || category.includes("meo")) return false;
    }

    return true;
};

const getMatchedCategories = (analysis, categories = []) => {
    const hints = [
        ...(analysis?.categoryHints || []),
        ...(analysis?.searchTerms || []),
    ];

    let matched = categories.filter((category) => {
        const normalizedCategory = normalizeTerm(category.type);
        return hints.some((hint) => includesTerm(normalizedCategory, hint));
    });

    if (analysis?.petType) {
        matched = matched.filter((category) =>
            categoryBelongsToPetType(category.type, analysis.petType),
        );
    }

    return matched;
};

const buildFullHaystack = (product = {}) =>
    normalizeTerm(
        [
            product.name,
            product.description,
            product.category,
            ...(product.variants || []).map(
                (variant) =>
                    `${variant.variant_label || ""} ${variant.color || ""} ${variant.size || ""} ${variant.pet_weight || ""}`,
            ),
        ]
            .filter(Boolean)
            .join(" "),
    );

const belongsToPetType = (product, petType) => {
    if (!petType) return true;

    const haystack = buildFullHaystack(product);
    const hasDogSignal = haystack.includes("dog") || haystack.includes("cho");
    const hasCatSignal = haystack.includes("cat") || haystack.includes("meo");

    if (petType === "cat") {
        return hasCatSignal && !hasDogSignal;
    }

    if (petType === "dog") {
        return hasDogSignal && !hasCatSignal;
    }

    return true;
};

const getProductFormSignals = (product = {}) => {
    const haystack = buildFullHaystack(product);

    return {
        pate: haystack.includes("pate") || haystack.includes("wet food"),
        kibble:
            haystack.includes("kibble") ||
            haystack.includes("dry food") ||
            haystack.includes("hat"),
        milk: haystack.includes("milk") || haystack.includes("sua"),
        toy: haystack.includes("toy") || haystack.includes("do choi"),
        snack: haystack.includes("snack") || haystack.includes("treat"),
        shampoo: haystack.includes("shampoo") || haystack.includes("sua tam"),
    };
};

const matchesProductForm = (product, productForm) => {
    if (!productForm) return true;
    const signals = getProductFormSignals(product);
    return Boolean(signals[productForm]);
};

const scoreProduct = (product, analysis, matchedCategories = []) => {
    let score = 0;
    const matchedReasons = [];

    const name = normalizeTerm(product.name);
    const description = normalizeTerm(product.description);
    const category = normalizeTerm(product.category);
    const variantText = (product.variants || [])
        .map((variant) =>
            normalizeTerm(
                `${variant.variant_label || ""} ${variant.color || ""} ${variant.size || ""} ${variant.pet_weight || ""}`,
            ),
        )
        .join(" ");

    const haystack = `${name} ${description} ${category} ${variantText}`;

    const categoryMatched = matchedCategories.some(
        (item) => item.productCategories_id === product.productCategories_id,
    );

    if (categoryMatched) {
        score += 40;
        matchedReasons.push("category");
    }

    for (const hint of analysis?.categoryHints || []) {
        if (includesTerm(category, hint)) {
            score += 20;
            matchedReasons.push(`category_hint:${hint}`);
        }
    }

    for (const term of analysis?.searchTerms || []) {
        if (!term) continue;

        if (includesTerm(name, term)) {
            score += 16;
            matchedReasons.push(`name:${term}`);
            continue;
        }

        if (
            includesTerm(description, term) ||
            includesTerm(variantText, term)
        ) {
            score += 10;
            matchedReasons.push(`detail:${term}`);
            continue;
        }

        if (includesTerm(category, term)) {
            score += 18;
            matchedReasons.push(`category_term:${term}`);
        }
    }

    if (analysis?.petType === "dog") {
        if (haystack.includes("dog") || haystack.includes("cho")) {
            score += 12;
            matchedReasons.push("pet_type:dog");
        }

        if (haystack.includes("cat") || haystack.includes("meo")) {
            score -= 80;
            matchedReasons.push("pet_type_mismatch:cat");
        }
    }

    if (analysis?.petType === "cat") {
        if (haystack.includes("cat") || haystack.includes("meo")) {
            score += 12;
            matchedReasons.push("pet_type:cat");
        }

        if (haystack.includes("dog") || haystack.includes("cho")) {
            score -= 80;
            matchedReasons.push("pet_type_mismatch:dog");
        }
    }

    if (analysis?.petSize === "small") {
        if (
            haystack.includes("small") ||
            haystack.includes("size s") ||
            haystack.includes("mini") ||
            haystack.includes("1-3kg") ||
            haystack.includes("duoi 5kg")
        ) {
            score += 12;
            matchedReasons.push("pet_size");
        }
    }

    if (analysis?.petSize === "medium") {
        if (haystack.includes("medium") || haystack.includes("size m")) {
            score += 12;
            matchedReasons.push("pet_size");
        }
    }

    if (analysis?.petSize === "large") {
        if (haystack.includes("large") || haystack.includes("size l")) {
            score += 12;
            matchedReasons.push("pet_size");
        }
    }

    if (analysis?.productForm) {
        if (matchesProductForm(product, analysis.productForm)) {
            score += 35;
            matchedReasons.push(`product_form:${analysis.productForm}`);
        } else {
            score -= 50;
            matchedReasons.push(
                `product_form_mismatch:${analysis.productForm}`,
            );
        }
    }

    if (analysis?.discountMode === "discounted") {
        if (matchesDiscountMode(product, "discounted")) {
            score += 30;
            matchedReasons.push("discount_mode:discounted");
        } else {
            score -= 40;
            matchedReasons.push("discount_mode_mismatch:discounted");
        }
    }

    if (analysis?.discountMode === "non_discounted") {
        if (matchesDiscountMode(product, "non_discounted")) {
            score += 22;
            matchedReasons.push("discount_mode:non_discounted");
        } else {
            score -= 40;
            matchedReasons.push("discount_mode_mismatch:non_discounted");
        }
    }

    if (Number(product.quantity || 0) > 0) {
        score += 3;
        matchedReasons.push("in_stock");
    }

    return {
        score,
        matchedReasons,
    };
};

const calculateConfidence = (items = [], analysis = {}) => {
    const topScore = items[0]?._score || 0;
    if (topScore <= 0) return 0;

    let confidence = Math.min(1, topScore / 90);

    if (analysis?.productForm) confidence += 0.08;
    if (analysis?.petType) confidence += 0.05;
    if (analysis?.discountMode) confidence += 0.04;

    return Number(Math.min(1, confidence).toFixed(2));
};

const getVariantSummary = (product, analysis) => {
    const variants = product.variants || [];

    if (!product.has_variants || variants.length === 0) {
        const discounted = isProductBaseDiscounted(product);

        if (analysis?.discountMode === "discounted" && !discounted) {
            return null;
        }

        if (analysis?.discountMode === "non_discounted" && discounted) {
            return null;
        }

        return {
            display_price: Number(product.price || 0),
            display_original_price: Number(product.original_price || 0),
            display_quantity: Number(product.quantity || 0),
            matched_variant: null,
            matched_variants: [],
            price_min: Number(product.price || 0),
            price_max: Number(product.price || 0),
        };
    }

    const matchedVariants = filterVariantsByAnalysis(variants, analysis);

    if (
        (analysis?.discountMode || analysis?.petSize) &&
        matchedVariants.length === 0
    ) {
        return null;
    }

    const targetVariants = matchedVariants.length ? matchedVariants : variants;
    const prices = targetVariants.map((variant) => Number(variant.price || 0));
    const originalPrices = targetVariants.map((variant) =>
        Number(variant.original_price || 0),
    );
    const quantities = targetVariants.map((variant) =>
        Number(variant.quantity || 0),
    );

    const matchedVariant =
        targetVariants.find((variant) => Number(variant.quantity || 0) > 0) ||
        targetVariants[0] ||
        null;

    return {
        display_price: matchedVariant ? Number(matchedVariant.price || 0) : 0,
        display_original_price: matchedVariant
            ? Number(matchedVariant.original_price || 0)
            : 0,
        display_quantity: matchedVariant
            ? Number(matchedVariant.quantity || 0)
            : quantities.reduce((sum, value) => sum + value, 0),
        matched_variant: matchedVariant,
        matched_variants: targetVariants,
        price_min: prices.length ? Math.min(...prices) : 0,
        price_max: prices.length ? Math.max(...prices) : 0,
    };
};

const findRelevantProducts = async ({ message, analysis }) => {
    const categories = await ProductCategory.findAll({
        where: {
            isActive: true,
            isDelete: false,
        },
        attributes: ["productCategories_id", "type"],
        order: [["type", "ASC"]],
    });

    const matchedCategories = getMatchedCategories(analysis, categories);
    const categoryIds = matchedCategories.map(
        (category) => category.productCategories_id,
    );

    const products = await Product.findAll({
        where: {
            isActive: true,
            isDelete: false,
            ...(categoryIds.length
                ? {
                      productCategories_id: {
                          [Op.in]: categoryIds,
                      },
                  }
                : {}),
        },
        include: [
            {
                model: ProductCategory,
                as: "category",
                attributes: ["productCategories_id", "type"],
            },
            {
                model: ProductVariant,
                as: "variants",
                required: false,
                where: {
                    isActive: true,
                },
                attributes: [
                    "productVariant_id",
                    "variant_label",
                    "color",
                    "size",
                    "pet_weight",
                    "original_price",
                    "discount",
                    "discount_type",
                    "price",
                    "quantity",
                ],
            },
            {
                model: Media,
                as: "media",
                attributes: ["media_id", "url", "is_main", "alt_text"],
                required: false,
            },
        ],
        limit: categoryIds.length ? 80 : 60,
        order: [["updated_at", "DESC"]],
    });

    const mapped = products
        .map((product) => {
            const mediaList = product.media || [];
            const mainMedia =
                mediaList.find((item) => item.is_main) || mediaList[0] || null;

            const rawItem = {
                product_id: product.product_id,
                productCategories_id: product.productCategories_id,
                name: product.name,
                description: product.description,
                slug: product.slug,
                category: product.category?.type || null,
                has_variants: product.has_variants,

                price: Number(product.price || 0),
                original_price: Number(product.original_price || 0),
                quantity: Number(product.quantity || 0),

                image: mainMedia?.url || null,
                media: mediaList.map((item) => ({
                    media_id: item.media_id,
                    url: item.url,
                    is_main: item.is_main,
                    alt_text: item.alt_text,
                })),
                variants: (product.variants || []).map((variant) => ({
                    productVariant_id: variant.productVariant_id,
                    variant_label: variant.variant_label,
                    color: variant.color,
                    size: variant.size,
                    pet_weight: variant.pet_weight,
                    price: Number(variant.price || 0),
                    original_price: Number(variant.original_price || 0),
                    quantity: Number(variant.quantity || 0),
                    is_discounted: isVariantDiscounted(variant),
                })),
                analysis,
            };

            const variantSummary = getVariantSummary(rawItem, analysis);

            if (!variantSummary) {
                return null;
            }

            const discountState = getDiscountState(rawItem);

            const item = {
                ...rawItem,
                is_single_product: !rawItem.has_variants,
                price: variantSummary.display_price,
                original_price: variantSummary.display_original_price,
                quantity: variantSummary.display_quantity,
                price_min: variantSummary.price_min,
                price_max: variantSummary.price_max,

                matched_variant: rawItem.has_variants
                    ? variantSummary.matched_variant
                    : null,

                matched_variants: rawItem.has_variants
                    ? variantSummary.matched_variants
                    : [],

                variants: rawItem.has_variants
                    ? variantSummary.matched_variants.length
                        ? variantSummary.matched_variants
                        : rawItem.variants
                    : [],

                all_variants: rawItem.has_variants ? rawItem.variants : [],
                all_variants_count: rawItem.has_variants
                    ? rawItem.variants.length
                    : 0,
                matched_variants_count: rawItem.has_variants
                    ? variantSummary.matched_variants.length
                    : 0,

                has_discounted_variants: rawItem.has_variants
                    ? discountState.has_discounted
                    : false,

                has_non_discounted_variants: rawItem.has_variants
                    ? discountState.has_non_discounted
                    : false,

                has_mixed_discount_variants: rawItem.has_variants
                    ? discountState.mixed
                    : false,
            };

            const result = scoreProduct(item, analysis, matchedCategories);

            return {
                ...item,
                _score: result.score,
                _matched_reasons: result.matchedReasons,
            };
        })
        .filter(Boolean);

    const petTypeFiltered = analysis?.petType
        ? mapped.filter((item) => belongsToPetType(item, analysis.petType))
        : mapped;

    const formFiltered = analysis?.productForm
        ? petTypeFiltered.filter((item) =>
              matchesProductForm(item, analysis.productForm),
          )
        : petTypeFiltered;

    const discountFiltered = analysis?.discountMode
        ? formFiltered.filter((item) =>
              matchesDiscountMode(item, analysis.discountMode),
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
        .sort((a, b) => b._score - a._score || b.quantity - a.quantity)
        .filter((item) => item._score > 0);

    const finalItems =
        ranked.length > 0 ? ranked.slice(0, 4) : basePool.slice(0, 4);

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
        confidence: calculateConfidence(finalItems, analysis),
    };
};

module.exports = {
    findRelevantProducts,
};
