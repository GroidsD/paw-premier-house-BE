import db from "../models/index.js";
import { Op } from "sequelize";
import { semanticSearchProducts } from "./semanticSearch.js";
import { getTopSelling } from "./statsQueries.js";

// ⚙️ Recommendation logic chính
export async function recommendForUser({
    userId = null,
    userText = null,
    limit = 6,
}) {
    // 1️⃣ Nếu user đã từng mua hàng -> gợi ý sản phẩm cùng category
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

        // lấy danh sách category user từng mua
        const categories = new Set();
        for (const order of userOrders) {
            for (const item of order.orderItems) {
                if (item.product?.productCategories_id) {
                    categories.add(item.product.productCategories_id);
                }
            }
        }

        // nếu user có category, lấy các sản phẩm cùng loại
        if (categories.size > 0) {
            const products = await db.Product.findAll({
                where: {
                    productCategories_id: { [Op.in]: Array.from(categories) },
                    isActive: true,
                    isDelete: false,
                },
                include: [
                    {
                        model: db.ProductTranslate,
                        as: "translates",
                        where: { language: "vi" },
                        required: false,
                    },
                ],
                limit,
            });

            if (products.length > 0) return products;
        }
    }

    // 2️⃣ Nếu user chưa có lịch sử mua -> dùng semantic search dựa theo text người dùng
    if (userText) {
        const matches = await semanticSearchProducts(userText, "vi", limit);
        const productIds = matches.map((m) => m.product_id);
        const products = await db.Product.findAll({
            where: { product_id: { [Op.in]: productIds } },
            include: [
                {
                    model: db.ProductTranslate,
                    as: "translates",
                    where: { language: "vi" },
                    required: false,
                },
            ],
        });
        return products;
    }

    // 3️⃣ Nếu không có userId hoặc text, fallback về top bán chạy
    return getTopSelling(limit);
}
