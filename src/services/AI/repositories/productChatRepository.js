const { Op } = require("sequelize");
const {
    Product,
    ProductCategory,
    ProductVariant,
    Media,
} = require("../../../models");

let cachedCategories = null;
let cachedCategoriesAt = 0;
const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;

const findActiveCategories = async ({ forceRefresh = false } = {}) => {
    const now = Date.now();

    if (
        !forceRefresh &&
        cachedCategories &&
        now - cachedCategoriesAt < CATEGORY_CACHE_TTL_MS
    ) {
        return cachedCategories;
    }

    const categories = await ProductCategory.findAll({
        where: {
            isActive: true,
            isDelete: false,
        },
        attributes: ["productCategories_id", "type_vi", "type_en"],
        order: [["type_en", "ASC"]],
    });

    cachedCategories = categories;
    cachedCategoriesAt = now;

    return categories;
};

const clearCategoryCache = () => {
    cachedCategories = null;
    cachedCategoriesAt = 0;
};

const findProductCandidates = async ({ categoryIds = [], limit = 30 }) => {
    return Product.findAll({
        attributes: [
            "product_id",
            "productCategories_id",
            "name",
            "description",
            "slug",
            "has_variants",
            "original_price",
            "discount",
            "discount_type",
            "price",
            "quantity",
            "updated_at",
        ],
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
                attributes: ["productCategories_id", "type_vi", "type_en"],
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
                    "product_id",
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
                required: false,
                attributes: [
                    "media_id",
                    "entity_id",
                    "url",
                    "is_main",
                    "alt_text",
                ],
            },
        ],
        limit,
        order: [["updated_at", "DESC"]],
    });
};
const findProductsByIds = async ({ productIds = [] }) => {
    if (!productIds.length) return [];

    return Product.findAll({
        attributes: [
            "product_id",
            "productCategories_id",
            "name",
            "description",
            "slug",
            "has_variants",
            "original_price",
            "discount",
            "discount_type",
            "price",
            "quantity",
            "updated_at",
        ],
        where: {
            product_id: {
                [Op.in]: productIds,
            },
            isActive: true,
            isDelete: false,
        },
        include: [
            {
                model: ProductCategory,
                as: "category",
                attributes: ["productCategories_id", "type_vi", "type_en"],
            },
            {
                model: ProductVariant,
                as: "variants",
                required: false,
                where: { isActive: true },
                attributes: [
                    "productVariant_id",
                    "product_id",
                    "variant_label",
                    "color",
                    "size",
                    "pet_weight",
                    "original_price",
                    "price",
                    "quantity",
                ],
            },
            {
                model: Media,
                as: "media",
                required: false,
                attributes: [
                    "media_id",
                    "entity_id",
                    "url",
                    "is_main",
                    "alt_text",
                ],
            },
        ],
    });
};

module.exports = {
    findActiveCategories,
    clearCategoryCache,
    findProductCandidates,
    findProductsByIds,
};
