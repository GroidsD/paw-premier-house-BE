const getVariantSummary = (product, analysis, helpers) => {
    const { isProductBaseDiscounted, filterVariantsByAnalysis } = helpers;
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

const mapProductRecord = (product, analysis, helpers) => {
    const { isVariantDiscounted, getDiscountState } = helpers;

    const mediaList = product.media || [];
    const mainMedia =
        mediaList.find((item) => item.is_main) || mediaList[0] || null;

    const rawItem = {
        product_id: product.product_id,
        productCategories_id: product.productCategories_id,
        name: product.name,
        description: product.description,
        slug: product.slug,
        category: analysis?.language === "en"
            ? (product.category?.type_en || product.category?.type_vi)
            : product.category?.type_vi,
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

    const variantSummary = getVariantSummary(rawItem, analysis, helpers);
    if (!variantSummary) return null;

    const discountState = getDiscountState(rawItem);

    return {
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
        all_variants_count: rawItem.has_variants ? rawItem.variants.length : 0,
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
};

module.exports = {
    mapProductRecord,
};
