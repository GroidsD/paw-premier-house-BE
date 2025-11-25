import db from "../models/index.js";
import { Op } from "sequelize";
import { semanticSearchProducts } from "./semanticSearch.js";
import { getTopSelling } from "./statsQueries.js";

// ⚙️ Recommendation logic nâng cao
export async function recommendForUser({
    userId = null,
    userText = null,
    userProfile = null,
    language = "vi",
    limit = 6,
}) {
    console.log("🎯 Recommending for user:", { userId, userProfile, language });

    // 1️⃣ Nếu user đã từng mua hàng -> gợi ý sản phẩm cùng category + trending
    if (userId) {
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

        // Lấy danh sách category user từng mua
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

        // Nếu user có category, lấy các sản phẩm cùng loại (nhưng chưa mua)
        if (categories.size > 0) {
            const products = await db.Product.findAll({
                where: {
                    productCategories_id: { [Op.in]: Array.from(categories) },
                    product_id: { [Op.notIn]: Array.from(purchasedProductIds) }, // Loại sản phẩm đã mua
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
                    ["sold", "DESC"], // Ưu tiên sản phẩm bán chạy
                    ["createdAt", "DESC"], // Sản phẩm mới
                ],
                limit,
            });

            if (products.length > 0) return products;
        }
    }

    // 2️⃣ Sử dụng user profile từ conversation memory
    if (userProfile) {
        const filters = {};

        if (userProfile.petType) {
            filters.pet_type = userProfile.petType;
        }

        if (userProfile.interests && userProfile.interests.length > 0) {
            // Lấy category phổ biến nhất
            filters.category = userProfile.interests[0];
        }

        if (userProfile.priceRange) {
            filters.price_range = userProfile.priceRange;
        }

        // Tạo query từ user profile
        const query = `${userProfile.petType || ""} ${userProfile.interests.join(" ")}`.trim();

        if (query) {
            const matches = await semanticSearchProducts(query, language, limit, filters);
            if (matches.length > 0) {
                // Dùng trực tiếp kết quả từ Supabase (đã có price)
                console.log("✅ Returning results from Supabase (with price)");
                return matches;
            }
        }
    }

    // 3️⃣ Nếu có userText -> dùng semantic search
    if (userText) {
        const matches = await semanticSearchProducts(userText, language, limit);
        if (matches.length > 0) {
            // Dùng trực tiếp kết quả từ Supabase (đã có price)
            console.log("✅ Returning results from Supabase (with price)");
            return matches;
        }
    }

    // 4️⃣ Fallback về top bán chạy
    return getTopSelling(limit);
}
