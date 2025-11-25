import openai from "../../config/openAI.js";
import supabase from "../../config/supabase.js";

/**
 * Semantic search với query expansion và filtering cho products
 */
export async function semanticSearchProducts(
    query,
    language = "vi",
    topK = 10,
    filters = {}
) {
    const expandedQuery = expandQuery(query, language);
    console.log("🔍 Expanded product query:", expandedQuery);

    const embedRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: expandedQuery,
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

    const { data, error } = await supabase.rpc("match_product_vectors", rpcParams);

    if (error) {
        console.error("❌ Supabase product search error:", error);
        return [];
    }

    console.log(`📊 Supabase returned ${data?.length || 0} product results (lang: ${language})`);

    if (!data || data.length === 0) {
        return retryProductSearch(rpcParams, language, filters, topK);
    }

    return processResults(data, filters, topK);
}

async function retryProductSearch(rpcParams, language, filters, topK) {
    console.log("⚠️ No product results found, trying with lower threshold...");
    const { data: retryData, error: retryError } = await supabase.rpc("match_product_vectors", {
        ...rpcParams,
        match_threshold: 0.1,
        match_count: topK * 2,
    });

    if (retryError) {
        console.error("❌ Product retry error:", retryError);
    }

    if (retryData?.length) {
        console.log(`📊 Retry returned ${retryData.length} product results`);
        return processResults(retryData, filters, topK);
    }

    const altLang = language === "vi" ? "en" : "vi";
    console.log(`⚠️ Trying alternative product language: ${altLang}`);

    const { data: altData } = await supabase.rpc("match_product_vectors", {
        ...rpcParams,
        query_lang: altLang,
        match_threshold: 0.1,
        match_count: topK * 2,
    });

    if (!altData || altData.length === 0) {
        console.log("❌ Still no product results");
        return [];
    }

    console.log(`📊 Alternative language returned ${altData.length} product results`);
    return processResults(altData, filters, topK);
}

function expandQuery(query, language) {
    let expanded = query;

    if (language === "vi") {
        if (/(mèo|con mèo)/.test(query)) expanded += " cat kitten feline";
        if (/(chó|con chó)/.test(query)) expanded += " dog puppy canine";
        if (/(thức ăn|đồ ăn)/.test(query)) expanded += " food nutrition meal";
        if (/(đồ chơi)/.test(query)) expanded += " toy play entertainment";
        if (/(phụ kiện)/.test(query)) expanded += " accessory collar leash";
        if (/(giường|nệm)/.test(query)) expanded += " bed cushion mat";
        if (/(bát|chén)/.test(query)) expanded += " bowl dish feeder";
    } else {
        if (/(cat|kitten)/.test(query)) expanded += " mèo";
        if (/(dog|puppy)/.test(query)) expanded += " chó";
        if (/(food|meal)/.test(query)) expanded += " thức ăn";
        if (/(toy|play)/.test(query)) expanded += " đồ chơi";
    }

    return expanded;
}

function getCategoryVariants(category) {
    const categoryMap = {
        food: ["food", "thức ăn", "đồ ăn"],
        toy: ["toy", "đồ chơi", "toys"],
        accessory: ["accessory", "phụ kiện", "accessories"],
        healthcare: ["healthcare", "chăm sóc", "health"],
        shampoo: ["shampoo", "dầu tắm", "tắm"],
        "thức ăn": ["food", "thức ăn", "đồ ăn"],
        "đồ chơi": ["toy", "đồ chơi", "toys"],
        "phụ kiện": ["accessory", "phụ kiện", "accessories"],
        "chăm sóc": ["healthcare", "chăm sóc", "health"],
        "dầu tắm": ["shampoo", "dầu tắm", "tắm"],
    };

    const key = (category || "").toLowerCase();
    return categoryMap[key] || [category];
}

function processResults(data, filters, topK) {
    let results = data.map((d) => ({
        product_id: d.product_id,
        price: d.price,
        original_price: d.original_price,
        discount: d.discount,
        category: d.category,
        similarity: d.similarity || 0,
        translates: [
            { name: d.name_vi || d.name_en || d.name, language: "vi" },
            { name: d.name_en || d.name_vi || d.name, language: "en" },
        ],
    }));

    if (filters.category) {
        const categoryVariants = getCategoryVariants(filters.category);
        results = results.filter((p) => {
            if (!p.category) return false;
            const categoryLower = p.category.toLowerCase();
            return categoryVariants.some((variant) =>
                categoryLower.includes(variant.toLowerCase())
            );
        });
    }

    if (filters.price_range) {
        const { min, max } = filters.price_range;
        results = results.filter((p) => {
            if (min && p.price < min) return false;
            if (max && p.price > max) return false;
            return true;
        });
    }

    if (filters.pet_type) {
        results = results.filter((p) => {
            const searchText = `${p.category} ${p.translates[0].name}`.toLowerCase();
            return searchText.includes(filters.pet_type.toLowerCase());
        });
    }

    results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    return results.slice(0, topK);
}

export async function hybridSearch(query, language = "vi", topK = 10) {
    const semanticResults = await semanticSearchProducts(query, language, topK);
    return semanticResults;
}

