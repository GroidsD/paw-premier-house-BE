import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import db from "../models/index.js";
import { Op } from "sequelize";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function embedProducts() {
    const products = await db.Product.findAll({
        where: { isActive: true, isDelete: false },
        include: [
            {
                model: db.ProductTranslate,
                as: "translates",
                where: { language: { [Op.in]: ["vi", "en"] } },
                required: true,
            },
            {
                model: db.ProductCategory,
                as: "category",
                include: [
                    {
                        model: db.ProductCategoryTranslate,
                        as: "translates",
                        where: { language: { [Op.in]: ["vi", "en"] } },
                        required: false,
                    },
                ],
            },
        ],
    });

    console.log(`🟢 Found ${products.length} products`);

    let successCount = 0;
    let errorCount = 0;

    for (const p of products) {
        const productId = p.product_id;

        for (const t of p.translates) {
            if (!t.name) continue;

            // Lấy category theo ngôn ngữ
            const catTranslate = p.category?.translates?.find(
                (ct) => ct.language === t.language
            );
            const categoryName = catTranslate?.type || "general";

            // 🔥 Tạo nội dung embedding phong phú hơn
            const metadata = buildProductMetadata(p, t, categoryName);
            const content = generateEmbeddingContent(p, t, categoryName, metadata);

            console.log(
                `🟢 Embedding: ${productId} [${t.language}] ${t.name} (${categoryName})`
            );

            const embeddingRes = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: content,
            });

            const embedding = embeddingRes.data[0].embedding;

            // Lưu với metadata đầy đủ (convert to integers)
            const row = {
                product_id: productId,
                name: t.name,
                name_vi: t.language === "vi" ? t.name : null,
                name_en: t.language === "en" ? t.name : null,
                price: parseInt(p.price) || 0,
                original_price: p.original_price ? parseInt(p.original_price) : null,
                discount: p.discount ? parseInt(p.discount) : null,
                content,
                embedding,
                category: categoryName.toLowerCase(),
                language: t.language,
                // Thêm metadata
                sold: parseInt(p.sold) || 0,
                stock: parseInt(p.stock) || 0,
                rating: parseFloat(p.rating) || 0,
            };

            const { data, error } = await supabase
                .from("product_vectors")
                .upsert(row, {
                    onConflict: "product_id,language",
                });

            if (error) {
                console.error("❌ Supabase error:", error);
                errorCount++;
            } else {
                console.log(`   ✅ Inserted successfully`);
                successCount++;
            }
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Embeddings completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${successCount + errorCount}`);
    console.log("=".repeat(50));
}

/**
 * Build metadata từ product
 */
function buildProductMetadata(product, translate, categoryName) {
    const metadata = {
        tags: [],
        attributes: [],
        popularity: "normal",
    };

    // Tags từ category
    if (categoryName.toLowerCase().includes("food")) {
        metadata.tags.push("nutrition", "meal", "eating");
    } else if (categoryName.toLowerCase().includes("toy")) {
        metadata.tags.push("play", "entertainment", "fun");
    } else if (categoryName.toLowerCase().includes("accessory")) {
        metadata.tags.push("gear", "equipment", "utility");
    }

    // Popularity
    if (product.sold > 100) {
        metadata.popularity = "bestseller";
        metadata.tags.push("popular", "trending", "hot");
    } else if (product.sold > 50) {
        metadata.popularity = "popular";
    }

    // Stock status
    if (product.stock < 10) {
        metadata.tags.push("limited", "low stock", "hurry");
    }

    // Discount
    if (product.discount > 0) {
        metadata.tags.push("sale", "discount", "promotion", "deal");
    }

    // Price range
    if (product.price < 50000) {
        metadata.tags.push("affordable", "budget-friendly", "cheap");
    } else if (product.price > 500000) {
        metadata.tags.push("premium", "high-end", "luxury");
    }

    return metadata;
}

/**
 * Generate rich embedding content
 */
function generateEmbeddingContent(product, translate, categoryName, metadata) {
    const parts = [];

    // Tên sản phẩm
    parts.push(`Tên: ${translate.name}`);

    // Mô tả
    if (translate.description) {
        parts.push(`Mô tả: ${translate.description}`);
    }

    // Category
    parts.push(`Danh mục: ${categoryName}`);

    // Giá
    parts.push(`Giá: ${product.price} VNĐ`);
    if (product.discount > 0) {
        parts.push(`Giảm giá: ${product.discount}%`);
    }

    // Popularity
    if (product.sold > 0) {
        parts.push(`Đã bán: ${product.sold} sản phẩm`);
    }

    // Tags
    if (metadata.tags.length > 0) {
        parts.push(`Tags: ${metadata.tags.join(", ")}`);
    }

    // Ngôn ngữ
    parts.push(`Ngôn ngữ: ${translate.language}`);

    return parts.join(". ");
}

embedProducts();

