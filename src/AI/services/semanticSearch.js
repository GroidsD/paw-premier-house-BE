import openai from "../../config/openAI.js";
import supabase from "../../config/supabase.js";

export async function semanticSearchServices(
    query,
    language = "vi",
    topK = 5,
    filters = {}
) {
    const expandedQuery = expandServiceQuery(query, language);
    console.log("🧽 Service expanded query:", expandedQuery);

    const embedRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: expandedQuery || query || "pet service",
    });

    const userEmbedding = embedRes.data[0].embedding;
    const rpcParams = {
        query_embedding: userEmbedding,
        match_count: topK * 2,
        match_threshold: filters.strict ? 0.7 : 0.5,
        query_lang: language,
        filter_category: filters.category || null,
        filter_min_price: filters.price_range?.min || null,
        filter_max_price: filters.price_range?.max || null,
    };

    const { data, error } = await supabase.rpc("match_service_vectors", rpcParams);

    if (error) {
        console.error("❌ match_service_vectors error:", error);
        return [];
    }

    if (!data || data.length === 0) {
        return retryServiceSearch(rpcParams, language, filters, topK);
    }

    return processServiceResults(data, filters, topK);
}

async function retryServiceSearch(rpcParams, language, filters, topK) {
    console.log("⚠️ No service match, lowering threshold & switching lang");
    const retryParams = { ...rpcParams, match_threshold: 0.1 };
    const { data: retryData } = await supabase.rpc("match_service_vectors", retryParams);

    if (retryData?.length) {
        return processServiceResults(retryData, filters, topK);
    }

    const altLang = language === "vi" ? "en" : "vi";
    const { data: altData } = await supabase.rpc("match_service_vectors", {
        ...retryParams,
        query_lang: altLang,
    });

    return processServiceResults(altData ?? [], filters, topK);
}

function expandServiceQuery(query = "", language = "vi") {
    let expanded = query;
    const lower = query.toLowerCase();

    const mapping = {
        vi: [
            { key: /(tắm|spa)/, extra: "spa bath grooming relax" },
            { key: /(cắt tỉa|groom)/, extra: "grooming fur trim style" },
            {
                key: /(khách sạn|lưu trú|hotel|boarding)/,
                extra: "hotel boarding stay overnight",
            },
            { key: /(huấn luyện|training)/, extra: "training obedience behavior" },
        ],
        en: [
            { key: /(spa|bath)/, extra: "tắm thư giãn" },
            { key: /(groom|trim)/, extra: "cắt tỉa lông" },
            { key: /(hotel|boarding)/, extra: "khách sạn lưu trú" },
            { key: /(training|coach)/, extra: "huấn luyện" },
        ],
    };

    const rules = mapping[language] || mapping.vi;
    for (const rule of rules) {
        if (rule.key.test(lower)) {
            expanded += ` ${rule.extra}`;
        }
    }

    return expanded.trim();
}

function processServiceResults(data = [], filters, topK) {
    if (!data?.length) return [];

    let mapped = data.map((row) => ({
        service_id: row.service_id,
        price: row.price,
        category: row.category,
        rating: row.rating,
        similarity: row.similarity,
        translates: [
            row.name_vi ? { language: "vi", name: row.name_vi } : null,
            row.name_en ? { language: "en", name: row.name_en } : null,
        ].filter(Boolean),
    }));

    if (filters?.price_range) {
        const { min, max } = filters.price_range;
        mapped = mapped.filter((service) => {
            if (min && service.price < min) return false;
            if (max && service.price > max) return false;
            return true;
        });
    }

    mapped.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    return mapped.slice(0, topK);
}

