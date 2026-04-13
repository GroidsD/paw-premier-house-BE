require("dotenv").config();

const OpenAI = require("openai");
const supabase = require("../config/supabaseClient");
const { Product, ProductCategory, ProductVariant } = require("../../../models");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = "text-embedding-3-small";

const normalizeText = (value = "") =>
    String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const detectPetType = (text = "") => {
    const value = normalizeText(text);

    if (
        value.includes("cho") ||
        value.includes("dog") ||
        value.includes("puppy") ||
        value.includes("cun")
    ) {
        return "dog";
    }

    if (
        value.includes("meo") ||
        value.includes("cat") ||
        value.includes("kitten") ||
        value.includes("boss")
    ) {
        return "cat";
    }

    return null;
};

const detectProductForm = (text = "") => {
    const value = normalizeText(text);

    if (value.includes("pate") || value.includes("wet food")) return "pate";
    if (
        value.includes("hat") ||
        value.includes("kibble") ||
        value.includes("dry food")
    ) {
        return "kibble";
    }
    if (value.includes("sua") || value.includes("milk")) return "milk";
    if (value.includes("do choi") || value.includes("toy")) return "toy";
    if (value.includes("snack") || value.includes("treat")) return "snack";
    if (value.includes("sua tam") || value.includes("shampoo")) return "shampoo";

    return null;
};

const buildVariantText = (variants = []) => {
    if (!Array.isArray(variants) || variants.length === 0) return "";

    return variants
        .map((variant) =>
            [
                variant.variant_label,
                variant.color,
                variant.size,
                variant.pet_weight,
            ]
                .filter(Boolean)
                .join(" "),
        )
        .filter(Boolean)
        .join(". ");
};

const buildContent = (product) => {
    const categoryName = product.category?.type || "";
    const variantsText = buildVariantText(product.variants || []);

    const rawText = [
        product.name,
        product.description,
        `Category: ${categoryName}`,
        variantsText ? `Variants: ${variantsText}` : "",
    ]
        .filter(Boolean)
        .join(". ");

    return rawText.replace(/\s+/g, " ").trim();
};

const buildMetadata = (product, content) => {
    const categoryName = product.category?.type || "";
    const petType = detectPetType(`${categoryName} ${content}`);
    const productForm = detectProductForm(`${categoryName} ${content}`);

    return {
        category: categoryName || null,
        pet_type: petType,
        product_form: productForm,
        has_variants: Boolean(product.has_variants),
    };
};

const formatEmbeddingForPgvector = (embedding = []) =>
    `[${embedding.join(",")}]`;

const fetchProducts = async () => {
    return Product.findAll({
        attributes: [
            "product_id",
            "productCategories_id",
            "name",
            "description",
            "slug",
            "has_variants",
            "price",
            "original_price",
            "quantity",
            "isActive",
            "isDelete",
            "updated_at",
        ],
        where: {
            isActive: true,
            isDelete: false,
        },
        include: [
            {
                model: ProductCategory,
                as: "category",
                attributes: ["productCategories_id", "type"],
            },
            {
                model: ProductVariant,
                as: "variants",
                required: false,
                where: {
                    isActive: true,
                },
                attributes: [
                    "productVariant_id",
                    "variant_label",
                    "color",
                    "size",
                    "pet_weight",
                    "price",
                    "original_price",
                    "quantity",
                ],
            },
        ],
        order: [["updated_at", "DESC"]],
    });
};

const upsertEmbeddingRow = async ({
    productId,
    content,
    embedding,
    metadata,
}) => {
    const { error } = await supabase.from("product_embeddings").upsert(
        {
            product_id: productId,
            content,
            embedding: formatEmbeddingForPgvector(embedding),
            metadata,
            updated_at: new Date().toISOString(),
        },
        {
            onConflict: "product_id",
        },
    );

    if (error) {
        throw error;
    }
};

const main = async () => {
    console.log("Fetching products from MySQL...");
    const products = await fetchProducts();
    console.log(`Found ${products.length} active products.`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const product of products) {
        try {
            const content = buildContent(product);

            if (!content || content.length < 10) {
                skipCount += 1;
                console.log(
                    `Skipped product ${product.product_id}: content too short`,
                );
                continue;
            }

            const metadata = buildMetadata(product, content);

            const response = await openai.embeddings.create({
                model: EMBEDDING_MODEL,
                input: content,
            });

            const embedding = response.data?.[0]?.embedding || [];

            if (!embedding.length) {
                throw new Error("Empty embedding returned");
            }

            await upsertEmbeddingRow({
                productId: product.product_id,
                content,
                embedding,
                metadata,
            });

            successCount += 1;
            console.log(
                `Synced product ${product.product_id} - ${product.name}`,
            );
        } catch (error) {
            failCount += 1;
            console.error(
                `Failed product ${product.product_id} - ${product.name}:`,
                error.message,
            );
        }
    }

    console.log("Sync completed:", {
        total: products.length,
        successCount,
        skipCount,
        failCount,
    });
};

main().catch((error) => {
    console.error("syncProductEmbeddings error:", error);
    process.exit(1);
});