import openai from "../config/openAI.js";
import supabase from "../config/supabase.js";

/**
 * Semantic search với query expansion và filtering
 * @param {string} query - Câu hỏi người dùng
 * @param {string} language - Ngôn ngữ (vi/en)
 * @param {number} topK - Số lượng kết quả
 * @param {Object} filters - Filters bổ sung {category, pet_type, price_range}
 * @returns {Array} Danh sách sản phẩm
 */
export async function semanticSearchProducts(
    query,
    language = "vi",
    topK = 10,
    filters = {}
) {
    // 1️⃣ Query expansion - mở rộng query để tìm kiếm tốt hơn
    const expandedQuery = expandQuery(query, language);
    console.log("🔍 Expanded query:", expandedQuery);

    // 2️⃣ Tạo embedding
    const embedRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: expandedQuery,
    });

    const userEmbedding = embedRes.data[0].embedding;

    // 3️⃣ Tìm kiếm với threshold hợp lý và filters
    const matchThreshold = filters.strict ? 0.7 : 0.5;

    // Build RPC parameters
    const rpcParams = {
        query_embedding: userEmbedding,
        match_count: topK * 2, // Lấy nhiều hơn để filter
        match_threshold: matchThreshold,
        query_lang: language,
        filter_category: filters.category || null,
        filter_min_price: filters.price_range?.min || null,
        filter_max_price: filters.price_range?.max || null,
    };

    const { data, error } = await supabase.rpc("match_product_vectors", rpcParams);

    if (error) {
        console.error("❌ Supabase search error:", error);
        return [];
    }

    console.log(`📊 Supabase returned ${data?.length || 0} results (lang: ${language})`);

    if (!data || data.length === 0) {
        console.log("⚠️ No results found, trying with lower threshold...");
        // Retry với threshold thấp hơn
        const { data: retryData, error: retryError } = await supabase.rpc("match_product_vectors", {
            ...rpcParams,
            match_threshold: 0.1,
            match_count: topK * 2,
        });

        if (retryError) {
            console.error("❌ Retry error:", retryError);
        }

        console.log(`📊 Retry returned ${retryData?.length || 0} results`);

        // Nếu vẫn không có kết quả, thử ngôn ngữ khác
        if (!retryData || retryData.length === 0) {
            const altLang = language === "vi" ? "en" : "vi";
            console.log(`⚠️ Trying alternative language: ${altLang}`);

            const { data: altData } = await supabase.rpc("match_product_vectors", {
                ...rpcParams,
                query_lang: altLang,
                match_threshold: 0.1,
                match_count: topK * 2,
            });

            console.log(`📊 Alternative language returned ${altData?.length || 0} results`);

            if (!altData || altData.length === 0) {
                console.log("❌ Still no results even with alternative language");
                return [];
            }

            return processResults(altData, filters, topK);
        }

        return processResults(retryData, filters, topK);
    }

    return processResults(data, filters, topK);
}

/**
 * Mở rộng query với synonyms và context
 */
function expandQuery(query, language) {
    let expanded = query;

    // Thêm synonyms cho tiếng Việt
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

/**
 * Map category từ tiếng Anh sang tiếng Việt và ngược lại
 */
function getCategoryVariants(category) {
    const categoryMap = {
        // English -> Vietnamese variants
        "food": ["food", "thức ăn", "đồ ăn"],
        "toy": ["toy", "đồ chơi", "toys"],
        "accessory": ["accessory", "phụ kiện", "accessories"],
        "healthcare": ["healthcare", "chăm sóc", "health"],
        "shampoo": ["shampoo", "dầu tắm", "tắm"],

        // Vietnamese -> English variants
        "thức ăn": ["food", "thức ăn", "đồ ăn"],
        "đồ chơi": ["toy", "đồ chơi", "toys"],
        "phụ kiện": ["accessory", "phụ kiện", "accessories"],
        "chăm sóc": ["healthcare", "chăm sóc", "health"],
        "dầu tắm": ["shampoo", "dầu tắm", "tắm"],
    };

    const key = category.toLowerCase();
    return categoryMap[key] || [category];
}


/**
 * Xử lý và filter kết quả
 */
function processResults(data, filters, topK) {
    let results = data.map((d) => ({
        product_id: d.product_id,
        price: d.price,
        original_price: d.original_price,
        discount: d.discount,
        category: d.category,
        similarity: d.similarity || 0, // Thêm similarity score
        translates: [
            { name: d.name_vi || d.name_en || d.name, language: "vi" },
            { name: d.name_en || d.name_vi || d.name, language: "en" },
        ],
    }));

    // Apply filters
    if (filters.category) {
        const categoryVariants = getCategoryVariants(filters.category);
        results = results.filter((p) => {
            if (!p.category) return false;
            const categoryLower = p.category.toLowerCase();
            // Check if category matches any variant
            return categoryVariants.some(variant =>
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
        // Filter theo pet type trong category hoặc name
        results = results.filter((p) => {
            const searchText = `${p.category} ${p.translates[0].name}`.toLowerCase();
            return searchText.includes(filters.pet_type.toLowerCase());
        });
    }

    // Sort theo similarity (nếu có)
    results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

    // Limit results
    return results.slice(0, topK);
}

/**
 * Hybrid search: Kết hợp semantic + keyword
 */
export async function hybridSearch(query, language = "vi", topK = 10) {
    // 1. Semantic search
    const semanticResults = await semanticSearchProducts(query, language, topK);

    // 2. Keyword search (fallback nếu semantic không tốt)
    // TODO: Implement keyword search với PostgreSQL full-text search

    return semanticResults;
}
