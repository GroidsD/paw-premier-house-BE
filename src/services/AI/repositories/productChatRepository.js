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
        attributes: ["productCategories_id", "type"],
        order: [["type", "ASC"]],
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
        limit,
        order: [["updated_at", "DESC"]],
    });
};

module.exports = {
    findActiveCategories,
    clearCategoryCache,
    findProductCandidates,
};
