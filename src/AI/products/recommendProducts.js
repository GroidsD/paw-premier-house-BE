import db from "../../models/index.js";
import { Op } from "sequelize";
import { semanticSearchProducts } from "./semanticSearch.js";
import { getTopSelling } from "./statsQueries.js";

export async function recommendForUser({
    userId = null,
    userText = null,
    userProfile = null,
    language = "vi",
    limit = 6,
}) {
    console.log("🎯 Recommending products for user:", { userId, userProfile, language });

    if (userId) {
        const historyRecommendations = await recommendFromOrderHistory(userId, limit);
        if (historyRecommendations.length > 0) return historyRecommendations;
    }

    if (userProfile) {
        const profileRecommendations = await recommendFromProfile(userProfile, language, limit);
        if (profileRecommendations.length > 0) return profileRecommendations;
    }

    if (userText) {
        const textMatches = await semanticSearchProducts(userText, language, limit);
        if (textMatches.length > 0) {
            console.log("✅ Returning results from Supabase (with price)");
            return textMatches;
        }
    }

    return getTopSelling(limit);
}

async function recommendFromOrderHistory(userId, limit) {
    const userOrders = await db.Order.findAll({
        where: { customer_id: userId },
        include: [
            {
                model: db.OrderItem,
                as: "orderItems",
                include: [{ model: db.Product, as: "product" }],
            },
        ],
    });

    const categories = new Set();
    const purchasedProductIds = new Set();

    for (const order of userOrders) {
        for (const item of order.orderItems) {
            if (item.product?.productCategories_id) {
                categories.add(item.product.productCategories_id);
                purchasedProductIds.add(item.product.product_id);
            }
        }
    }

    if (categories.size === 0) return [];

    const products = await db.Product.findAll({
        where: {
            productCategories_id: { [Op.in]: Array.from(categories) },
            product_id: { [Op.notIn]: Array.from(purchasedProductIds) },
            isActive: true,
            isDelete: false,
        },
        include: [
            {
                model: db.ProductTranslate,
                as: "translates",
                required: false,
            },
        ],
        order: [
            ["sold", "DESC"],
            ["createdAt", "DESC"],
        ],
        limit,
    });

    return products;
}

async function recommendFromProfile(userProfile, language, limit) {
    const filters = {};

    if (userProfile.petType) {
        filters.pet_type = userProfile.petType;
    }

    if (userProfile.interests && userProfile.interests.length > 0) {
        filters.category = userProfile.interests[0];
    }

    if (userProfile.priceRange) {
        filters.price_range = userProfile.priceRange;
    }

    const query = `${userProfile.petType || ""} ${userProfile.interests.join(" ")}`.trim();

    if (!query) return [];

    const matches = await semanticSearchProducts(query, language, limit, filters);
    if (matches.length > 0) {
        console.log("✅ Returning profile-based results from Supabase (with price)");
        return matches;
    }

    return [];
}

