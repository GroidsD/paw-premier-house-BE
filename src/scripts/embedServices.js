import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import db from "../models/index.js";
import { Op } from "sequelize";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function embedServices() {
    const services = await db.Service.findAll({
        where: { isActive: true, isDeleted: false },
        include: [
            {
                model: db.ServiceTranslate,
                as: "translates",
                where: { language: { [Op.in]: ["vi", "en"] } },
                required: true,
            },
            {
                model: db.ServiceCategory,
                as: "category",
            },
        ],
    });

    console.log(`🛁 Found ${services.length} services for embedding`);

    let successCount = 0;
    let errorCount = 0;

    for (const service of services) {
        for (const translate of service.translates) {
            if (!translate.name) continue;

            const categoryName = (service.category?.type || "general").toLowerCase();
            const metadata = buildServiceMetadata(service, categoryName);
            const content = generateServiceContent(
                service,
                translate,
                categoryName,
                metadata
            );

            console.log(
                `🟦 Embedding service ${service.service_id} [${translate.language}] ${translate.name}`
            );

            try {
                const embeddingRes = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: content,
                });

                const embedding = embeddingRes.data[0].embedding;

                const row = {
                    service_id: service.service_id,
                    name: translate.name,
                    name_vi: translate.language === "vi" ? translate.name : null,
                    name_en: translate.language === "en" ? translate.name : null,
                    price: parseInt(service.price) || 0,
                    content,
                    embedding,
                    category: categoryName,
                    language: translate.language,
                    rating: metadata.rating,
                };

                const { error } = await supabase.from("service_vectors").upsert(row, {
                    onConflict: "service_id,language",
                });

                if (error) {
                    console.error("❌ Supabase upsert error:", error);
                    errorCount++;
                } else {
                    successCount++;
                    console.log("   ✅ Upserted successfully");
                }
            } catch (error) {
                console.error("❌ Embedding error:", error);
                errorCount++;
            }
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Service embeddings completed!");
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total processed translations: ${successCount + errorCount}`);
    console.log("=".repeat(50));

    await db.sequelize.close();
}

function buildServiceMetadata(service, categoryName) {
    const metadata = {
        tags: [],
        rating: 0,
    };

    switch (categoryName) {
        case "spa":
            metadata.tags.push("grooming", "bath", "relax");
            break;
        case "grooming":
            metadata.tags.push("cut", "trim", "fur", "style");
            break;
        case "hotel":
            metadata.tags.push("boarding", "stay", "overnight");
            break;
        case "training":
            metadata.tags.push("obedience", "behavior", "coach");
            break;
        default:
            metadata.tags.push("pet care");
            break;
    }

    // Simple heuristic: cheaper services tagged as affordable
    const numericPrice = parseInt(service.price) || 0;
    if (numericPrice < 100000) metadata.tags.push("affordable");
    if (numericPrice > 500000) metadata.tags.push("premium");

    return metadata;
}

function generateServiceContent(service, translate, categoryName, metadata) {
    const parts = [
        `Tên dịch vụ: ${translate.name}`,
        `Danh mục: ${categoryName}`,
        `Giá: ${service.price} VNĐ`,
    ];

    if (translate.description) {
        parts.push(`Mô tả: ${translate.description}`);
    }

    if (metadata.tags.length) {
        parts.push(`Tags: ${metadata.tags.join(", ")}`);
    }

    parts.push(`Ngôn ngữ: ${translate.language}`);
    return parts.join(". ");
}

embedServices()
    .then(() => {
        console.log("🏁 Service embedding script finished");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Service embedding script failed:", error);
        process.exit(1);
    });

