const OpenAI = require("openai");
const supabase = require("../config/supabaseClient");
const normalizeText = require("../../../utils/normalizeText");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = "text-embedding-3-small";

const semanticCache = new Map();
const SEMANTIC_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_SEMANTIC_CACHE_SIZE = 200;

const buildSemanticCacheKey = ({ message, limit = 8 }) =>
    JSON.stringify({
        normalized: normalizeText(message),
        limit,
    });

const getCachedSemanticResult = (cacheKey) => {
    const cached = semanticCache.get(cacheKey);

    if (!cached) return null;

    const isExpired = Date.now() - cached.createdAt > SEMANTIC_CACHE_TTL_MS;
    if (isExpired) {
        semanticCache.delete(cacheKey);
        return null;
    }

    return Array.isArray(cached.value) ? cached.value : null;
};

const setCachedSemanticResult = (cacheKey, value) => {
    if (!Array.isArray(value)) return;

    if (semanticCache.size >= MAX_SEMANTIC_CACHE_SIZE) {
        const oldestKey = semanticCache.keys().next().value;
        if (oldestKey) {
            semanticCache.delete(oldestKey);
        }
    }

    semanticCache.set(cacheKey, {
        value,
        createdAt: Date.now(),
    });
};

const searchProductsBySemantic = async ({ message, limit = 8 }) => {
    try {
        const cacheKey = buildSemanticCacheKey({ message, limit });
        const cached = getCachedSemanticResult(cacheKey);

        if (cached) {
            console.log("semantic search timing:", {
                cacheHit: true,
                finalCount: cached.length,
            });
            return cached;
        }

        const embeddingResponse = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: message,
        });

        const embedding = embeddingResponse?.data?.[0]?.embedding;

        if (!Array.isArray(embedding) || embedding.length === 0) {
            throw new Error("Failed to create query embedding");
        }

        const formattedEmbedding = `[${embedding.join(",")}]`;

        const { data, error } = await supabase.rpc("match_product_embeddings", {
            query_embedding: formattedEmbedding,
            match_count: limit,
        });

        if (error) {
            throw error;
        }

        const result = Array.isArray(data) ? data : [];

        setCachedSemanticResult(cacheKey, result);

        console.log("semantic search timing:", {
            cacheHit: false,
            finalCount: result.length,
        });

        return result;
    } catch (error) {
        console.error("searchProductsBySemantic error:", error.message);
        throw error;
    }
};

module.exports = {
    searchProductsBySemantic,
};
