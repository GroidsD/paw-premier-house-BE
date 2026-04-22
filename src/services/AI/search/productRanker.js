const normalizeText = require("../../../utils/normalizeText");

const normalizeTerm = (value = "") => normalizeText(String(value || ""));

const includesTerm = (haystack = "", term = "") => {
    const normalizedHaystack = normalizeTerm(haystack);
    const normalizedTerm = normalizeTerm(term);

    if (!normalizedTerm || normalizedTerm.length < 2) return false;

    return normalizedHaystack.includes(normalizedTerm);
};

const hasWholeTerm = (text = "", term = "") => {
    const normalizedText = normalizeTerm(text);
    const normalizedTerm = normalizeTerm(term);

    if (!normalizedTerm) return false;

    const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, "i");

    return pattern.test(normalizedText);
};

const isVariantDiscounted = (variant = {}) =>
    Number(variant.original_price || 0) > Number(variant.price || 0);

const isProductBaseDiscounted = (product = {}) =>
    Number(product.original_price || 0) > Number(product.price || 0);

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

const matchVariantByPetSize = (variant = {}, petSize = null) => {
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

    const hasDogSignal =
        hasWholeTerm(category, "dog") ||
        category.includes("cho cho") ||
        category.includes("dog ");
    const hasCatSignal =
        hasWholeTerm(category, "cat") ||
        category.includes("cho meo") ||
        category.includes("cat ");

    if (petType === "cat") {
        if (hasDogSignal && !hasCatSignal) return false;
        return true;
    }

    if (petType === "dog") {
        if (hasCatSignal && !hasDogSignal) return false;
        return true;
    }

    return true;
};

const getMatchedCategories = (analysis = {}, categories = []) => {
    const rawHints = [
        ...(analysis?.categoryHints || []),
        ...(analysis?.searchTerms || []),
    ];

    const genericHints = new Set([
        "pet",
        "pets",
        "san pham",
        "product",
        "products",
        "item",
        "items",
        "care",
        "dog",
        "cat",
    ]);

    const hints = rawHints.filter((hint) => {
        const normalizedHint = normalizeTerm(hint);
        return normalizedHint && !genericHints.has(normalizedHint);
    });

    let matched = categories.filter((category) => {
        const normalizedCategory = normalizeTerm(category.type);
        return hints.some((hint) => includesTerm(normalizedCategory, hint));
    });

    const formToCategoryMatchers = {
        shampoo: ["hygiene", "care", "ve sinh", "lam sach"],
        wipes: ["hygiene", "care", "ve sinh", "lam sach"],
        litter: ["hygiene", "care", "cat litter", "litter"],
        brush: ["hygiene", "care", "grooming"],
    };

    if (analysis?.productForm && formToCategoryMatchers[analysis.productForm]) {
        const matchedByFormCategory = categories.filter((category) => {
            const type = normalizeTerm(category.type);
            return formToCategoryMatchers[analysis.productForm].some(
                (keyword) => type.includes(normalizeTerm(keyword)),
            );
        });

        if (matchedByFormCategory.length > 0) {
            matched = matchedByFormCategory;
        }
    }

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

const hasDogSemanticSignal = (haystack = "") =>
    hasWholeTerm(haystack, "dog") ||
    hasWholeTerm(haystack, "dogs") ||
    hasWholeTerm(haystack, "puppy") ||
    haystack.includes("thuc an cho cho") ||
    haystack.includes("pate cho cho") ||
    haystack.includes("do choi cho cho") ||
    haystack.includes("cho dang moc rang") ||
    haystack.includes("cho moc rang");

const hasCatSemanticSignal = (haystack = "") =>
    hasWholeTerm(haystack, "cat") ||
    hasWholeTerm(haystack, "cats") ||
    hasWholeTerm(haystack, "kitten") ||
    haystack.includes("thuc an cho meo") ||
    haystack.includes("pate cho meo") ||
    haystack.includes("do choi cho meo") ||
    haystack.includes("meo ken an");

const GENERIC_FORMS = new Set(["shampoo", "wipes", "brush", "litter"]);

const belongsToPetType = (product = {}, petType = null) => {
    if (!petType) return true;

    const haystack = buildFullHaystack(product);
    const hasDogSignal = hasDogSemanticSignal(haystack);
    const hasCatSignal = hasCatSemanticSignal(haystack);

    if (petType === "cat") {
        return hasCatSignal && !hasDogSignal;
    }

    if (petType === "dog") {
        return hasDogSignal && !hasCatSignal;
    }

    return true;
};

const shouldSkipPetTypeFilter = (analysis = {}) =>
    Boolean(analysis?.productForm && GENERIC_FORMS.has(analysis.productForm));

const getProductFormSignals = (product = {}) => {
    const haystack = buildFullHaystack(product);

    return {
        pate: hasWholeTerm(haystack, "pate") || haystack.includes("wet food"),

        kibble:
            hasWholeTerm(haystack, "kibble") ||
            haystack.includes("dry food") ||
            hasWholeTerm(haystack, "hat"),

        milk: hasWholeTerm(haystack, "milk") || hasWholeTerm(haystack, "sua"),

        toy:
            hasWholeTerm(haystack, "toy") ||
            haystack.includes("do choi") ||
            hasWholeTerm(haystack, "ball") ||
            hasWholeTerm(haystack, "chew"),

        snack:
            hasWholeTerm(haystack, "snack") || hasWholeTerm(haystack, "treat"),

        shampoo:
            hasWholeTerm(haystack, "shampoo") ||
            hasWholeTerm(haystack, "pet shampoo") ||
            hasWholeTerm(haystack, "deodorizing pet shampoo") ||
            hasWholeTerm(haystack, "sua tam"),

        wipes:
            hasWholeTerm(haystack, "wipes") ||
            hasWholeTerm(haystack, "cleaning wipes") ||
            hasWholeTerm(haystack, "wet wipes"),

        litter:
            hasWholeTerm(haystack, "litter") ||
            hasWholeTerm(haystack, "cat litter") ||
            hasWholeTerm(haystack, "bentonite"),

        brush:
            hasWholeTerm(haystack, "brush") ||
            hasWholeTerm(haystack, "grooming brush"),
    };
};

const matchesProductForm = (product = {}, productForm = null) => {
    if (!productForm) return true;

    const signals = getProductFormSignals(product);
    const matched = Boolean(signals[productForm]);

    return matched;
};

const scoreProduct = (product = {}, analysis = {}, matchedCategories = []) => {
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
    const hasDogSignal = hasDogSemanticSignal(haystack);
    const hasCatSignal = hasCatSemanticSignal(haystack);

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
        if (hasDogSignal) {
            score += 18;
            matchedReasons.push("pet_type:dog");
        }

        if (hasCatSignal && !hasDogSignal) {
            score -= 120;
            matchedReasons.push("pet_type_mismatch:cat");
        }
    }

    if (analysis?.petType === "cat") {
        if (hasCatSignal) {
            score += 18;
            matchedReasons.push("pet_type:cat");
        }

        if (hasDogSignal && !hasCatSignal) {
            score -= 120;
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
            score -= 80;
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
    const topItem = items[0];
    const topScore = topItem?._final_score || topItem?._score || 0;

    if (topScore <= 0) return 0;

    let confidence = Math.min(1, topScore / 110);

    if (analysis?.productForm) confidence += 0.06;
    if (analysis?.petType) confidence += 0.05;
    if (analysis?.discountMode) confidence += 0.08;

    if (
        analysis?.petType &&
        topItem?._semantic_metadata?.pet_type &&
        topItem._semantic_metadata.pet_type !== analysis.petType
    ) {
        confidence -= 0.2;
    }

    return Number(Math.max(0, Math.min(1, confidence)).toFixed(2));
};

module.exports = {
    normalizeTerm,
    includesTerm,
    isVariantDiscounted,
    isProductBaseDiscounted,
    getDiscountState,
    matchVariantByPetSize,
    filterVariantsByAnalysis,
    matchesDiscountMode,
    categoryBelongsToPetType,
    getMatchedCategories,
    buildFullHaystack,
    belongsToPetType,
    getProductFormSignals,
    matchesProductForm,
    scoreProduct,
    calculateConfidence,
    shouldSkipPetTypeFilter,
};
