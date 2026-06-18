import db from "../models/index.js";
import { generateSlug } from "../utils/slug.js";
import mediaService from "./MediaService.js";
import { safeUnlinkByUrl } from "../helper/safeUnlinkByUrl.js";
import { extractLocalImageUrls } from "../utils/mediaUtils.js";

const hasMultiValueField = (variant) => {
    return [variant.size, variant.color, variant.pet_weight].some((field) =>
        String(field || "").includes(","),
    );
};

const buildVariantKey = (variant) => {
    return [
        String(variant.size || "")
            .trim()
            .toLowerCase(),
        String(variant.color || "")
            .trim()
            .toLowerCase(),
        String(variant.pet_weight || "")
            .trim()
            .toLowerCase(),
    ].join("|");
};

const calcFinalPrice = (
    originalPrice = 0,
    discount = 0,
    discountType = "fixed",
) => {
    const base = Number(originalPrice || 0);
    const discountValue = Number(discount || 0);

    let finalPrice = base;

    if (discountValue > 0) {
        finalPrice =
            discountType === "percent"
                ? base - (base * discountValue) / 100
                : base - discountValue;
    }

    return finalPrice < 0 ? 0 : finalPrice;
};

const validateVariants = (variants = []) => {
    if (!Array.isArray(variants) || variants.length === 0) {
        return "Variants are required when has_variants = true";
    }

    for (const variant of variants) {
        if (hasMultiValueField(variant)) {
            return "Each variant must contain only one size, one color, and one pet weight.";
        }

        if (Number(variant.original_price || 0) <= 0) {
            return "Each variant original price must be greater than 0.";
        }

        if (Number(variant.quantity || 0) < 0) {
            return "Variant quantity cannot be negative.";
        }

        if (Number(variant.discount || 0) < 0) {
            return "Variant discount cannot be negative.";
        }

        if (!["percent", "fixed"].includes(variant.discount_type || "fixed")) {
            return "Variant discount type must be 'percent' or 'fixed'.";
        }

        if (
            (variant.discount_type || "fixed") === "percent" &&
            Number(variant.discount || 0) > 100
        ) {
            return "Variant percent discount cannot be greater than 100.";
        }
    }

    const keys = variants.map(buildVariantKey);
    if (new Set(keys).size !== keys.length) {
        return "Duplicate variant combinations detected.";
    }

    return null;
};

const calcProductSummaryFromVariants = (variants = []) => {
    const activeVariants = variants.filter((v) => !!v.isActive);
    const source = activeVariants.length > 0 ? activeVariants : variants;

    const minPrice =
        source.length > 0
            ? Math.min(...source.map((v) => Number(v.price || 0)))
            : 0;

    const minOriginalPrice =
        source.length > 0
            ? Math.min(...source.map((v) => Number(v.original_price || 0)))
            : 0;

    const totalQuantity = source.reduce(
        (sum, v) => sum + Number(v.quantity || 0),
        0,
    );

    return {
        minPrice,
        minOriginalPrice,
        totalQuantity,
    };
};

/**
 * Helper to identify and delete image files that are no longer used by the product.
 * @param {string[]} oldUrls - URLs extracted from old text fields.
 * @param {string[]} newUrls - URLs extracted from new text fields + current gallery.
 */
const cleanupOrphanedFiles = async (oldUrls = [], newUrls = []) => {
    const newUrlsSet = new Set(newUrls);
    const orphaned = oldUrls.filter((url) => url && !newUrlsSet.has(url));

    for (const url of orphaned) {
        await safeUnlinkByUrl(url);
    }
};

/**
 * Extracts and cleans up all local images used in a product's description/summary.
 */
const cleanupAllProductDescriptionImages = async (product) => {
    if (!product) return;
    const urls = [
        ...extractLocalImageUrls(product.description_vi),
        ...extractLocalImageUrls(product.summary_vi),
    ];
    for (const url of [...new Set(urls)]) {
        await safeUnlinkByUrl(url);
    }
};

let createProduct = async (data) => {
    const t = await db.sequelize.transaction();

    try {
        let {
            productCategories_id,
            name_vi,
            name_en,
            description_vi,
            description_en,
            summary_vi,
            summary_en,
            thumbnail_url,
            original_price,
            discount = 0,
            discount_type = "percent",
            quantity = 0,
            has_variants = false,
            variants = [],
            media = [],
        } = data;

        const validations = [
            {
                condition: !name_vi || name_vi.trim() === "",
                message: "Product name (Vietnamese) is required",
            },
            {
                condition: !productCategories_id,
                message: "Product category is required",
            },
            {
                condition: !["percent", "fixed"].includes(discount_type),
                message: "Discount type must be 'percent' or 'fixed'",
            },
            {
                condition: !has_variants && Number(original_price) < 0,
                message: "Original price must be greater than or equal to 0",
            },
            {
                condition: !has_variants && Number(quantity) < 0,
                message: "Quantity cannot be negative",
            },
            {
                condition: !has_variants && Number(discount || 0) < 0,
                message: "Discount cannot be negative",
            },
            {
                condition:
                    !has_variants &&
                    discount_type === "percent" &&
                    Number(discount || 0) > 100,
                message: "Percent discount cannot be greater than 100",
            },
        ];

        for (const rule of validations) {
            if (rule.condition) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: rule.message,
                };
            }
        }

        if (has_variants) {
            const variantError = validateVariants(variants);
            if (variantError) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: variantError,
                };
            }
        }

        let baseSlug = generateSlug(name_vi);
        let slug = baseSlug;
        let count = 1;

        while (await db.Product.findOne({ where: { slug }, transaction: t })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const basePrice = Number(original_price || 0);
        const newDiscount = Number(discount || 0);
        const newDiscountType = discount_type || "fixed";

        const product = await db.Product.create(
            {
                productCategories_id,
                name_vi,
                name_en: name_en || name_vi,
                slug,
                description_vi,
                description_en: description_en || description_vi,
                summary_vi,
                summary_en: summary_en || summary_vi,
                thumbnail_url: Array.isArray(media)
                    ? media.find((m) => m.is_main)?.url || media[0]?.url || null
                    : null,
                has_variants,
                original_price: has_variants ? 0 : basePrice,
                discount: has_variants ? 0 : newDiscount,
                discount_type: has_variants ? "fixed" : newDiscountType,
                quantity: has_variants ? 0 : Number(quantity || 0),
                reserved_quantity: 0,
                price: has_variants
                    ? 0
                    : calcFinalPrice(basePrice, newDiscount, newDiscountType),
            },
            { transaction: t },
        );

        if (Array.isArray(media) && media.length > 0) {
            await mediaService.createMediaForEntity(
                media,
                product.product_id,
                "product",
                t,
            );
        }

        let createdVariants = [];

        if (has_variants) {
            createdVariants = await Promise.all(
                variants.map(async (variant) => {
                    return await db.ProductVariant.create(
                        {
                            product_id: product.product_id,
                            sku: variant.sku || null,
                            color: variant.color || null,
                            size: variant.size || null,
                            pet_weight: variant.pet_weight || null,
                            variant_label: variant.variant_label || null,
                            original_price: Number(variant.original_price || 0),
                            discount: Number(variant.discount || 0),
                            discount_type: variant.discount_type || "fixed",
                            quantity: Number(variant.quantity || 0),
                            reserved_quantity: Number(
                                variant.reserved_quantity || 0,
                            ),
                            price: calcFinalPrice(
                                Number(variant.original_price || 0),
                                Number(variant.discount || 0),
                                variant.discount_type || "fixed",
                            ),
                            thumbnail_url: null, // Skipping per user request
                            isActive:
                                variant.isActive !== undefined
                                    ? !!variant.isActive
                                    : true,
                        },
                        { transaction: t },
                    );
                }),
            );

            const { minPrice, minOriginalPrice, totalQuantity } =
                calcProductSummaryFromVariants(createdVariants);

            await product.update(
                {
                    price: minPrice,
                    original_price: minOriginalPrice,
                    quantity: totalQuantity,
                    discount: 0,
                    discount_type: "fixed",
                },
                { transaction: t },
            );
        }

        await t.commit();

        const productWithRelations = await db.Product.findByPk(
            product.product_id,
            {
                include: [
                    { model: db.Media, as: "media" },
                    { model: db.ProductCategory, as: "category" },
                    { model: db.ProductVariant, as: "variants" },
                ],
            },
        );

        return {
            errCode: 0,
            errMessage: "Product created",
            product: productWithRelations,
        };
    } catch (e) {
        await t.rollback();
        return {
            errCode: -1,
            errMessage: "Server error",
            details: e.message,
        };
    }
};

let getAllProducts = (lang = "vi") => {
    return new Promise(async (resolve, reject) => {
        try {
            let products = await db.Product.findAll({
                attributes: [
                    "product_id",
                    "productCategories_id",
                    "name_vi",
                    "name_en",
                    "slug",
                    "description_vi",
                    "description_en",
                    "summary_vi",
                    "summary_en",
                    "thumbnail_url",
                    "price",
                    "original_price",
                    "discount",
                    "discount_type",
                    "quantity",
                    "isActive",
                    "has_variants",
                    "created_at",
                ],
                include: [
                    {
                        model: db.ProductCategory,
                        as: "category",
                        attributes: ["productCategories_id", "type_vi", "type_en"],
                    },
                    {
                        model: db.Media,
                        as: "media",
                    },
                    {
                        model: db.ProductVariant,
                        as: "variants",
                    },
                ],
                order: [["product_id", "ASC"]],
            });

            // Map response fields based on language
            const mappedProducts = products.map(product => {
                const plainProduct = product.get({ plain: true });
                return {
                    ...plainProduct,
                    name: lang === "en" ? (plainProduct.name_en || plainProduct.name_vi) : plainProduct.name_vi,
                    summary: lang === "en" ? (plainProduct.summary_en || plainProduct.summary_vi) : plainProduct.summary_vi,
                    description: lang === "en" ? (plainProduct.description_en || plainProduct.description_vi) : plainProduct.description_vi,
                    // Remove multilingual fields from response
                    name_vi: undefined,
                    name_en: undefined,
                    summary_vi: undefined,
                    summary_en: undefined,
                    description_vi: undefined,
                    description_en: undefined,
                };
            });

            resolve(mappedProducts);
        } catch (e) {
            reject(e);
        }
    });
};

let getProductById = (product_id, lang = "vi") => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await db.Product.findByPk(product_id, {
                attributes: [
                    "product_id",
                    "productCategories_id",
                    "name_vi",
                    "name_en",
                    "slug",
                    "price",
                    "original_price",
                    "discount",
                    "discount_type",
                    "quantity",
                    "isActive",
                    "has_variants",
                    "description_vi",
                    "description_en",
                    "summary_vi",
                    "summary_en",
                    "thumbnail_url",
                    "created_at",
                ],
                include: [
                    {
                        model: db.ProductCategory,
                        as: "category",
                        attributes: ["productCategories_id", "type_vi", "type_en"],
                    },
                    {
                        model: db.Media,
                        as: "media",
                    },
                    {
                        model: db.ProductVariant,
                        as: "variants",
                    },
                ],
            });

            if (!product) {
                return resolve({
                    errCode: 1,
                    errMessage: "Product not found",
                    product: null,
                });
            }

            // Map response fields based on language
            const plainProduct = product.get({ plain: true });
            const mappedProduct = {
                ...plainProduct,
                name: lang === "en" ? (plainProduct.name_en || plainProduct.name_vi) : plainProduct.name_vi,
                summary: lang === "en" ? (plainProduct.summary_en || plainProduct.summary_vi) : plainProduct.summary_vi,
                description: lang === "en" ? (plainProduct.description_en || plainProduct.description_vi) : plainProduct.description_vi,
            };

            resolve({
                errCode: 0,
                errMessage: "Product retrieved successfully",
                product: mappedProduct,
            });
        } catch (e) {
            reject({
                errCode: -1,
                errMessage: "Server error",
                details: e.toString(),
            });
        }
    });
};

let updateProduct = async (product_id, data, files) => {
    const t = await db.sequelize.transaction();

    try {
        let {
            productCategories_id,
            name_vi,
            name_en,
            description_vi,
            description_en,
            summary_vi,
            summary_en,
            thumbnail_url,
            original_price,
            discount,
            discount_type,
            quantity,
            isActive,
            isDelete,
            has_variants,
            variants = [],
            removedVariantIds = [],
            removedMediaIds = [],
            replaceAllImages = false,
            mainIndex = 0,
            mainOldId = null,
        } = data;

        const product = await db.Product.findByPk(product_id, {
            transaction: t,
        });

        if (!product) {
            await t.rollback();
            return {
                errCode: 1,
                errMessage: "Product not found",
                product: null,
            };
        }

        // Track images before update for cleanup
        const oldDescriptionImages = extractLocalImageUrls(product.description_vi);
        const oldSummaryImages = extractLocalImageUrls(product.summary_vi);
        const oldImages = [
            ...new Set([...oldDescriptionImages, ...oldSummaryImages]),
        ];

        const nextHasVariants =
            has_variants !== undefined
                ? !!has_variants
                : !!product.has_variants;

        await product.update(
            {
                productCategories_id:
                    productCategories_id ?? product.productCategories_id,
                name_vi: name_vi ?? product.name_vi,
                name_en: name_en ?? product.name_en,
                description_vi: description_vi ?? product.description_vi,
                description_en: description_en ?? product.description_en,
                summary_vi: summary_vi ?? product.summary_vi,
                summary_en: summary_en ?? product.summary_en,
                isActive: isActive ?? product.isActive,
                isDelete: isDelete ?? product.isDelete,
                has_variants: nextHasVariants,
            },
            { transaction: t },
        );

        if (nextHasVariants) {
            if (!Array.isArray(variants)) {
                variants = [];
            }

            const variantError =
                variants.length > 0 ? validateVariants(variants) : null;

            if (variantError) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: variantError,
                };
            }

            if (
                Array.isArray(removedVariantIds) &&
                removedVariantIds.length > 0
            ) {
                await db.ProductVariant.destroy({
                    where: {
                        productVariant_id: removedVariantIds,
                        product_id: product_id,
                    },
                    transaction: t,
                });
            }

            for (const variant of variants) {
                const payload = {
                    product_id: product_id,
                    sku: variant.sku || null,
                    color: variant.color || null,
                    size: variant.size || null,
                    pet_weight: variant.pet_weight || null,
                    variant_label: variant.variant_label || null,
                    original_price: Number(variant.original_price || 0),
                    discount: Number(variant.discount || 0),
                    discount_type: variant.discount_type || "fixed",
                    price: calcFinalPrice(
                        Number(variant.original_price || 0),
                        Number(variant.discount || 0),
                        variant.discount_type || "fixed",
                    ),
                    thumbnail_url: null, // Skipping per user request
                    quantity: Number(variant.quantity || 0),
                    reserved_quantity: Number(variant.reserved_quantity || 0),
                    isActive:
                        variant.isActive !== undefined
                            ? !!variant.isActive
                            : true,
                };

                if (variant.productVariant_id) {
                    await db.ProductVariant.update(payload, {
                        where: {
                            productVariant_id: variant.productVariant_id,
                            product_id: product_id,
                        },
                        transaction: t,
                    });
                } else {
                    await db.ProductVariant.create(payload, {
                        transaction: t,
                    });
                }
            }

            const allVariants = await db.ProductVariant.findAll({
                where: {
                    product_id: product_id,
                },
                transaction: t,
            });

            if (!allVariants.length) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage:
                        "At least one variant is required when has_variants = true.",
                };
            }

            const fullVariantError = validateVariants(
                allVariants.map((v) => v.get({ plain: true })),
            );

            if (fullVariantError) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: fullVariantError,
                };
            }

            const { minPrice, minOriginalPrice, totalQuantity } =
                calcProductSummaryFromVariants(allVariants);

            await product.update(
                {
                    price: minPrice,
                    original_price: minOriginalPrice,
                    quantity: totalQuantity,
                    discount: 0,
                    discount_type: "fixed",
                },
                { transaction: t },
            );
        } else {
            const basePrice =
                original_price !== undefined
                    ? Number(original_price)
                    : Number(product.original_price);

            const newDiscount =
                discount !== undefined
                    ? Number(discount)
                    : Number(product.discount);

            const newDiscountType =
                discount_type !== undefined
                    ? discount_type
                    : product.discount_type;

            if (newDiscount < 0) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: "Discount cannot be negative",
                };
            }

            if (newDiscountType === "percent" && newDiscount > 100) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: "Percent discount cannot be greater than 100",
                };
            }

            if (!["percent", "fixed"].includes(newDiscountType)) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: "Discount type must be 'percent' or 'fixed'",
                };
            }

            if (basePrice < 0) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage:
                        "Original price must be greater than or equal to 0",
                };
            }

            if (Number(quantity ?? product.quantity) < 0) {
                await t.rollback();
                return {
                    errCode: 1,
                    errMessage: "Quantity cannot be negative",
                };
            }

            const finalPrice = calcFinalPrice(
                basePrice,
                newDiscount,
                newDiscountType,
            );

            await product.update(
                {
                    original_price: basePrice,
                    discount: newDiscount,
                    discount_type: newDiscountType,
                    price: finalPrice,
                    quantity: quantity ?? product.quantity,
                },
                { transaction: t },
            );

            await db.ProductVariant.destroy({
                where: { product_id: product_id },
                transaction: t,
            });
        }

        const setMainById = async (media_id) => {
            await db.Media.update(
                { is_main: false },
                {
                    where: {
                        entity_type: "product",
                        entity_id: String(product_id),
                    },
                    transaction: t,
                },
            );

            await db.Media.update(
                { is_main: true },
                {
                    where: {
                        media_id: Number(media_id),
                        entity_type: "product",
                        entity_id: String(product_id),
                    },
                    transaction: t,
                },
            );
        };

        if (!Array.isArray(removedMediaIds)) {
            removedMediaIds = [];
        }

        removedMediaIds = removedMediaIds
            .map((x) => Number(x))
            .filter((x) => Number.isFinite(x));

        if (replaceAllImages) {
            const oldMedia = await db.Media.findAll({
                where: {
                    entity_type: "product",
                    entity_id: String(product_id),
                },
                transaction: t,
            });

            for (const m of oldMedia) {
                await safeUnlinkByUrl(m.url);
            }

            await db.Media.destroy({
                where: {
                    entity_type: "product",
                    entity_id: String(product_id),
                },
                force: true,
                transaction: t,
            });
        }

        if (!replaceAllImages && removedMediaIds.length > 0) {
            const removeList = await db.Media.findAll({
                where: {
                    media_id: removedMediaIds,
                    entity_type: "product",
                    entity_id: String(product_id),
                },
                transaction: t,
            });

            for (const m of removeList) {
                await safeUnlinkByUrl(m.url);
            }

            await db.Media.destroy({
                where: {
                    media_id: removedMediaIds,
                    entity_type: "product",
                    entity_id: String(product_id),
                },
                force: true,
                transaction: t,
            });

            if (mainOldId && removedMediaIds.includes(Number(mainOldId))) {
                mainOldId = null;
            }
        }

        if (Array.isArray(files) && files.length > 0) {
            await db.Media.update(
                { is_main: false },
                {
                    where: {
                        entity_type: "product",
                        entity_id: String(product_id),
                    },
                    transaction: t,
                },
            );

            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                const url = `/uploadImageProducts/${f.filename}`;

                await db.Media.create(
                    {
                        entity_type: "product",
                        entity_id: String(product_id),
                        url,
                        is_main: i === Number(mainIndex),
                        alt_text: name_vi || product.name_vi,
                    },
                    { transaction: t },
                );
            }
        } else if (mainOldId) {
            await setMainById(mainOldId);
        } else {
            const remaining = await db.Media.findAll({
                where: {
                    entity_type: "product",
                    entity_id: String(product_id),
                },
                order: [["media_id", "ASC"]],
                transaction: t,
            });

            if (remaining.length > 0) {
                const hasMain = remaining.some((m) => !!m.is_main);
                if (!hasMain) {
                    await setMainById(remaining[0].media_id);
                }
            }
        }

        // Sync thumbnail_url with the main image
        const finalMainMedia = await db.Media.findOne({
            where: {
                entity_type: "product",
                entity_id: String(product_id),
                is_main: true,
            },
            transaction: t,
        });

        await product.update(
            {
                thumbnail_url: finalMainMedia ? finalMainMedia.url : null,
            },
            { transaction: t },
        );

        // Asset Cleanup for Description/Summary images
        const newDescriptionImages = extractLocalImageUrls(product.description);
        const newSummaryImages = extractLocalImageUrls(product.summary);

        // Also get all images currently in the gallery (Media table) to avoid deletion if still used there
        const currentGalleryMedia = await db.Media.findAll({
            where: { entity_type: "product", entity_id: String(product_id) },
            transaction: t,
        });
        const galleryUrls = currentGalleryMedia.map((m) => m.url);

        const newImages = [
            ...new Set([
                ...newDescriptionImages,
                ...newSummaryImages,
                ...galleryUrls,
            ]),
        ];

        await cleanupOrphanedFiles(oldImages, newImages);

        await t.commit();

        const updatedProduct = await db.Product.findByPk(product_id, {
            include: [
                { model: db.Media, as: "media" },
                { model: db.ProductCategory, as: "category" },
                { model: db.ProductVariant, as: "variants" },
            ],
        });

        return {
            errCode: 0,
            errMessage: "Product updated successfully",
            product: updatedProduct,
        };
    } catch (e) {
        await t.rollback();
        return {
            errCode: -1,
            errMessage: "Server error",
            details: e?.message || e.toString(),
        };
    }
};

let deleteProduct = async (id) => {
    let product = await db.Product.findByPk(id);
    if (!product) throw "Product not found";

    await db.ProductTranslate.destroy({ where: { product_id: id } });

    // Clean up all images from disk before deleting records
    await cleanupAllProductDescriptionImages(product);

    const mediaList = await db.Media.findAll({
        where: { entity_type: "product", entity_id: String(id) },
    });
    for (const m of mediaList) {
        await safeUnlinkByUrl(m.url);
    }

    await mediaService.deleteMediaByEntity("product", id);
    await product.destroy();

    return "Product deleted successfully";
};

let softDeleteProduct = async (product_id) => {
    let product = await db.Product.findByPk(product_id);
    if (!product) throw "Product not found";

    await product.update({ isActive: false, isDelete: true });
    return "Product soft deleted successfully";
};

let hardDeleteProduct = async (id) => {
    const product = await db.Product.findByPk(id);
    if (!product) throw "Product not found";

    const mediaList = await db.Media.findAll({
        where: { entity_type: "product", entity_id: String(id) },
    });

    for (const m of mediaList) {
        await safeUnlinkByUrl(m.url);
    }

    // Clean up all images from disk for description/summary
    await cleanupAllProductDescriptionImages(product);

    await db.Media.destroy({
        where: { entity_type: "product", entity_id: String(id) },
        force: true,
    });

    await product.destroy({ force: true });

    return "Product deleted successfully";
};

export default {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    softDeleteProduct,
    hardDeleteProduct,
};
