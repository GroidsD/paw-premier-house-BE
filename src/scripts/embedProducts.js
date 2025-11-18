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

    for (const p of products) {
        const productId = p.product_id;

        for (const t of p.translates) {
            if (!t.name) continue;

            // Lấy category theo ngôn ngữ
            const catTranslate = p.category?.translates?.find(
                (ct) => ct.language === t.language
            );
            const categoryName = catTranslate?.type || "general";

            // Nội dung embedding
            const content = `${t.name}. ${
                t.description || ""
            }. Loại sản phẩm: ${categoryName}. Giá: ${p.price} VNĐ. Ngôn ngữ: ${
                t.language
            }`;

            console.log(
                `🟢 Embedding: ${productId} [${t.language}] ${t.name} (${categoryName})`
            );

            const embeddingRes = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: content,
            });

            const embedding = embeddingRes.data[0].embedding;

            // Chỉ lưu name_vi / name_en nếu có
            const row = {
                product_id: productId,
                name: t.name, // cột NOT NULL
                name_vi: t.language === "vi" ? t.name : null,
                name_en: t.language === "en" ? t.name : null,
                price: p.price,
                original_price: p.original_price || null,
                discount: p.discount || null,
                content,
                embedding,
                category: categoryName.toLowerCase(),
                language: t.language,
            };

            const { error } = await supabase
                .from("product_vectors")
                .upsert(row, {
                    onConflict: ["product_id", "language"],
                });

            if (error) console.error("❌ Supabase error:", error);
        }
    }

    console.log("✅ Embeddings lưu xong (vi + en)!");
}

embedProducts();
