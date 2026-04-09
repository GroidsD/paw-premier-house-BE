const { Op } = require("sequelize");
const {
    Product,
    ProductCategory,
    ProductVariant,
    Media,
} = require("../models");
const extractProductSignals = require("../services/AI/productQueryAnalyzer");
const matchVariantByPetSize = (variant, petSize) => {
    const text =
        `${variant.variant_label || ""} ${variant.size || ""} ${variant.pet_weight || ""}`.toLowerCase();

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
const scoreProduct = (product, signals) => {
    let score = 0;

    const name = (product.name || "").toLowerCase();
    const description = (product.description || "").toLowerCase();
    const category = (product.category?.type || "").toLowerCase();

    const variantText = (product.variants || [])
        .map((v) =>
            `${v.variant_label || ""} ${v.color || ""} ${v.size || ""} ${v.pet_weight || ""}`.toLowerCase(),
        )
        .join(" ");

    const haystack = `${name} ${description} ${category} ${variantText}`;

    if (signals.petType === "dog") {
        if (haystack.includes("dog") || haystack.includes("cho")) score += 5;
        if (haystack.includes("cat") || haystack.includes("meo")) {
            score -= 100;
        }
        
    }

    if (signals.petType === "cat") {
        if (haystack.includes("cat") || haystack.includes("meo")) score += 5;
        if (haystack.includes("dog") || haystack.includes("cho")) {
            score -= 100;
        }
    }

    if (signals.productType === "food") {
        if (
            haystack.includes("food") ||
            haystack.includes("pate") ||
            haystack.includes("kibble") ||
            haystack.includes("snack") ||
            haystack.includes("thuc an")
        ) {
            score += 5;
        }
    }

    if (signals.productType === "toy") {
        if (
            haystack.includes("toy") ||
            haystack.includes("ball") ||
            haystack.includes("chew") ||
            haystack.includes("do choi")
        ) {
            score += 5;
        }
    }

    if (signals.productType === "bath") {
        if (
            haystack.includes("bath") ||
            haystack.includes("shampoo") ||
            haystack.includes("grooming") ||
            haystack.includes("sua tam")
        ) {
            score += 5;
        }
    }

    if (signals.petSize === "small") {
        if (
            haystack.includes("small") ||
            haystack.includes("size s") ||
            haystack.includes("mini") ||
            haystack.includes("1-3kg") ||
            haystack.includes("duoi 5kg")
        ) {
            score += 5;
        }
    }

    if (signals.petSize === "medium") {
        if (haystack.includes("medium") || haystack.includes("size m")) {
            score += 5;
        }
    }

    if (signals.petSize === "large") {
        if (haystack.includes("large") || haystack.includes("size l")) {
            score += 5;
        }
    }

    for (const keyword of signals.keywords || []) {
        if (haystack.includes(String(keyword).toLowerCase())) {
            score += 2;
        }
    }

    return score;
};
const findRelevantProducts = async ({ message }) => {
    const signals = extractProductSignals(message);

    const searchTerms = [...new Set((signals.keywords || []).filter(Boolean))];

    const keywordConditions = searchTerms.flatMap((term) => [
        { name: { [Op.like]: `%${term}%` } },
        { description: { [Op.like]: `%${term}%` } },
    ]);

    const products = await Product.findAll({
        where: {
            isActive: true,
            isDelete: false,
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
        limit: 50,
        order: [["updated_at", "DESC"]],
    });
    const getVariantSummary = (product, signals) => {
        const variants = product.variants || [];

        if (!product.has_variants || variants.length === 0) {
            return {
                display_price: Number(product.price || 0),
                display_original_price: Number(product.original_price || 0),
                display_quantity: Number(product.quantity || 0),
                matched_variant: null,
                price_min: Number(product.price || 0),
                price_max: Number(product.price || 0),
            };
        }

        let matchedVariants = variants;

        if (signals.petSize) {
            matchedVariants = variants.filter((v) =>
                matchVariantByPetSize(v, signals.petSize),
            );
        }

        const targetVariants = matchedVariants.length
            ? matchedVariants
            : variants;

        const prices = targetVariants.map((v) => Number(v.price || 0));
        const originalPrices = targetVariants.map((v) =>
            Number(v.original_price || 0),
        );
        const quantities = targetVariants.map((v) => Number(v.quantity || 0));

        const matchedVariant =
            targetVariants.find((v) => Number(v.quantity || 0) > 0) ||
            targetVariants[0];

        return {
            display_price: matchedVariant
                ? Number(matchedVariant.price || 0)
                : Math.min(...prices),
            display_original_price: matchedVariant
                ? Number(matchedVariant.original_price || 0)
                : Math.min(...originalPrices),
            display_quantity: matchedVariant
                ? Number(matchedVariant.quantity || 0)
                : quantities.reduce((a, b) => a + b, 0),
            matched_variant: matchedVariant || null,
            price_min: Math.min(...prices),
            price_max: Math.max(...prices),
        };
    };
    const mapped = products.map((product) => {
        const mediaList = product.media || [];
        const mainMedia =
            mediaList.find((item) => item.is_main) || mediaList[0] || null;
        const variantSummary = getVariantSummary(product, signals);
        const item = {
            product_id: product.product_id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            category: product.category?.type || null,
            has_variants: product.has_variants,

            price: variantSummary.display_price,
            original_price: variantSummary.display_original_price,
            quantity: variantSummary.display_quantity,

            price_min: variantSummary.price_min,
            price_max: variantSummary.price_max,
            matched_variant: variantSummary.matched_variant,

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
            })),
        };

        return {
            ...item,
            _score: scoreProduct(item, signals),
        };
    });

    const ranked = mapped
        .sort((a, b) => b._score - a._score || b.quantity - a.quantity)
        .filter((item) => item._score > 0);

    const finalItems =
        ranked.length > 0 ? ranked.slice(0, 4) : mapped.slice(0, 4);

    return {
        type: "products",
        items: finalItems,
        user_question: message,
        signals,
    };
};

module.exports = {
    findRelevantProducts,
};
