const { Product, ProductCategory, ProductVariant } = require("../models");

const findRelevantProducts = async ({ message }) => {
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
        ],
        limit: 5,
        order: [["updated_at", "DESC"]],
    });

    return {
        type: "products",
        items: products.map((product) => ({
            product_id: product.product_id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            category: product.category?.type || null,
            has_variants: product.has_variants,
            price: Number(product.price || 0),
            original_price: Number(product.original_price || 0),
            quantity: Number(product.quantity || 0),
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
        })),
        user_question: message,
    };
};

module.exports = {
    findRelevantProducts,
};
