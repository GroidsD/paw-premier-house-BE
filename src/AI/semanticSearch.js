import openai from "../config/openAI.js";
import supabase from "../config/supabase.js";

export async function semanticSearchProducts(
    query,
    language = "vi",
    topK = 10
) {
    const embedRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
    });

    const userEmbedding = embedRes.data[0].embedding;

    const { data, error } = await supabase.rpc("match_product_vectors", {
        query_embedding: userEmbedding,
        match_count: topK,
        match_threshold: 0.0,
        query_lang: language,
    });

    if (error) {
        console.error("Supabase search error:", error);
        return [];
    }

    if (!data || data.length === 0) return [];

    console.log(data, "products");

    return data.map((d) => ({
        product_id: d.product_id,
        price: d.price,
        original_price: d.original_price,
        discount: d.discount,
        category: d.category,
        translates: [
            { name: d.name_vi || d.name_en || d.name, language: "vi" },
            { name: d.name_en || d.name_vi || d.name, language: "en" },
        ],
    }));
}
