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
        where: { status: "active" },
        include: [
            {
                model: db.ProductTranslate,
                as: "translations",
                where: {
                    lang: { [Op.in]: ["vi", "en"] },
                },
            },
        ],
    });

    for (const p of products) {
        const productId = p.id || p.product_id;

        // ✅ Lặp qua từng bản dịch (vi, en)
        for (const t of p.translations) {
            if (!t.name) continue;

            const content = `${t.name}. ${t.description}. Giá: ${t.price} VNĐ. Ngôn ngữ: ${t.lang}`;
            console.log(`🟢 Embedding for: ${productId} [${t.lang}] ${t.name}`);

            const embeddingRes = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: content,
            });

            const embedding = embeddingRes.data[0].embedding;

            // ✅ Lưu từng ngôn ngữ vào Supabase
            const { error } = await supabase.from("product_vectors").upsert({
                product_id: productId,
                content,
                embedding,
                lang: t.lang,
            });

            if (error) console.error("❌ Supabase error:", error);
        }
    }

    console.log("✅ Đã lưu embeddings (vi + en) vào Supabase!");
}

embedProducts();
