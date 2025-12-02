-- ============================================
-- Service Vectors Table & RPC for Semantic Search
-- ============================================

-- 1. Extension for vector if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Table for service embeddings
CREATE TABLE IF NOT EXISTS service_vectors (
    id BIGSERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_vi TEXT,
    name_en TEXT,
    price INTEGER,
    content TEXT,
    embedding vector(1536),
    category TEXT,
    language TEXT NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, language)
);

-- 3. Indexes for fast similarity search
CREATE INDEX IF NOT EXISTS idx_service_vectors_embedding ON service_vectors USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_service_vectors_service_id ON service_vectors(service_id);
CREATE INDEX IF NOT EXISTS idx_service_vectors_language ON service_vectors(language);
CREATE INDEX IF NOT EXISTS idx_service_vectors_category ON service_vectors(category);
CREATE INDEX IF NOT EXISTS idx_service_vectors_rating ON service_vectors(rating DESC);

-- 4. RPC function to match services
CREATE OR REPLACE FUNCTION match_service_vectors(
    query_embedding vector(1536),
    match_count int DEFAULT 10,
    match_threshold float DEFAULT 0.5,
    query_lang text DEFAULT 'vi',
    filter_category text DEFAULT NULL,
    filter_min_price int DEFAULT NULL,
    filter_max_price int DEFAULT NULL
) RETURNS TABLE (
    service_id integer,
    name text,
    name_vi text,
    name_en text,
    price int,
    category text,
    rating decimal,
    similarity float
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        sv.service_id,
        sv.name,
        sv.name_vi,
        sv.name_en,
        sv.price,
        sv.category,
        sv.rating,
        1 - (sv.embedding <=> query_embedding) AS similarity
    FROM service_vectors sv
    WHERE sv.language = query_lang
        AND (1 - (sv.embedding <=> query_embedding)) > match_threshold
        AND (filter_category IS NULL OR sv.category ILIKE '%' || filter_category || '%')
        AND (filter_min_price IS NULL OR sv.price >= filter_min_price)
        AND (filter_max_price IS NULL OR sv.price <= filter_max_price)
    ORDER BY sv.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Verify creation
SELECT 'service_vectors' AS table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'service_vectors'
ORDER BY ordinal_position;
