import db from "../models/index.js";
import { generateSlug } from "../utils/slug.js";
import mediaService from "./MediaService.js";
import { safeUnlinkByUrl } from "../helper/safeUnlinkByUrl.js";
let createProduct = async (data) => {
    try {
        let {
            productCategories_id,
            name,
            description,
            original_price,
            discount = 0,
            discount_type = "percent",
            quantity = 0,
            media = [],
            tags = [],
        } = data;

        let baseSlug = generateSlug(data.slug || name);
        let slug = baseSlug;
        let count = 1;

        while (await db.Product.findOne({ where: { slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        let product = await db.Product.create({
            productCategories_id,
            name,
            slug,
            description,
            original_price,
            discount,
            discount_type,
            quantity,
        });

        await mediaService.createMediaForEntity(
            media,
            product.product_id,
            "product",
        );

        for (const tagName of tags) {
            let tagSlug = generateSlug(tagName);

            // tìm hoặc tạo tag
            const [tag] = await db.Tag.findOrCreate({
                where: { slug: tagSlug },
                defaults: {
                    name: tagName,
                    slug: tagSlug,
                },
            });

            // gắn tag cho product (DB sẽ chặn nếu trùng)
            await db.ProductTag.findOrCreate({
                where: {
                    product_id: product.product_id,
                    tag_id: tag.tag_id,
                },
            });
        }
        let productWithRelations = await db.Product.findByPk(
            product.product_id,
            {
                include: [
                    { model: db.Media, as: "media" },
                    {
                        model: db.Tag,
                        as: "tags",
                        through: { attributes: [] },
                    },
                ],
            },
        );

        return {
            errCode: 0,
            errMessage: "Product created",
            product: productWithRelations,
        };
    } catch (e) {
        throw e;
    }
};

let getAllProducts = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let products = await db.Product.findAll({
                attributes: [
                    "product_id",
                    "productCategories_id",
                    "name",
                    "slug",
                    "description",
                    "price",
                    "original_price",
                    "quantity",
                    "isActive",
                ],
                include: [
                    {
                        model: db.ProductCategory,
                        as: "category",
                        attributes: ["productCategories_id", "type"],
                    },
                    {
                        model: db.Tag,
                        as: "tags", // 👈 thêm tag
                        attributes: ["tag_id", "name", "slug"],
                        through: { attributes: [] }, // 👈 ẩn bảng trung gian
                    },
                    {
                        model: db.Media,
                        as: "media",
                    },
                ],
                order: [["product_id", "ASC"]],
            });

            resolve(products);
        } catch (e) {
            reject(e);
        }
    });
};

let getProductById = (product_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await db.Product.findByPk(product_id, {
                attributes: [
                    "product_id",
                    "productCategories_id",
                    "name",
                    "slug",
                    "price",
                    "quantity",
                    "isActive",
                    "description",
                ],
                include: [
                    {
                        model: db.ProductCategory,
                        as: "category",
                        attributes: ["productCategories_id", "type"],
                    },
                    {
                        model: db.Tag,
                        as: "tags",
                        attributes: ["tag_id", "name", "slug"],
                        through: { attributes: [] }, // ẩn bảng product_tags
                    },
                    {
                        model: db.Media,
                        as: "media",
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

            resolve({
                errCode: 0,
                errMessage: "Product retrieved successfully",
                product,
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
    try {
        let {
            productCategories_id,
            name,
            description,
            original_price,
            discount,
            discount_type,
            quantity,
            isActive,
            isDelete,

            removedMediaIds = [],
            replaceAllImages = false,
            mainIndex = 0, // main index trong files mới
            mainOldId = null, // nếu chọn main là ảnh cũ (media_id)
        } = data;

        // ✅ normalize removedMediaIds -> number[]
        if (typeof removedMediaIds === "string") {
            try {
                removedMediaIds = JSON.parse(removedMediaIds);
            } catch {}
        }
        if (Array.isArray(removedMediaIds)) {
            removedMediaIds = removedMediaIds
                .map((x) => Number(x))
                .filter((x) => Number.isFinite(x));
        } else {
            removedMediaIds = [];
        }

        const product = await db.Product.findByPk(product_id);
        if (!product) {
            return {
                errCode: 1,
                errMessage: "Product not found",
                product: null,
            };
        }

        // ===== PRICE CALC =====
        const basePrice =
            original_price !== undefined
                ? Number(original_price)
                : Number(product.original_price);

        const newDiscount =
            discount !== undefined
                ? Number(discount)
                : Number(product.discount);

        const newDiscountType =
            discount_type !== undefined ? discount_type : product.discount_type;

        let finalPrice = basePrice;
        if (Number(newDiscount) > 0) {
            finalPrice =
                newDiscountType === "percent"
                    ? basePrice - (basePrice * newDiscount) / 100
                    : basePrice - newDiscount;
        }
        finalPrice = finalPrice < 0 ? 0 : finalPrice;

        // ===== UPDATE PRODUCT INFO =====
        await product.update({
            productCategories_id:
                productCategories_id ?? product.productCategories_id,
            name: name ?? product.name,
            description: description ?? product.description,
            original_price: basePrice,
            discount: newDiscount,
            discount_type: newDiscountType,
            price: finalPrice,
            quantity: quantity ?? product.quantity,
            isActive: isActive ?? product.isActive,
            isDelete: isDelete ?? product.isDelete,
        });

        // ===== MEDIA UPDATE =====
        // helper: set main cho 1 media_id cụ thể
        const setMainById = async (media_id) => {
            await db.Media.update(
                { is_main: false },
                {
                    where: {
                        entity_type: "product",
                        entity_id: String(product_id),
                    },
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
                },
            );
        };

        // 1) replaceAllImages => xóa hết media cũ (DB + file)
        if (replaceAllImages) {
            const oldMedia = await db.Media.findAll({
                where: {
                    entity_type: "product",
                    entity_id: String(product_id),
                },
            });

            for (const m of oldMedia) {
                await safeUnlinkByUrl(m.url);
            }

            await db.Media.destroy({
                where: {
                    entity_type: "product",
                    entity_id: String(product_id),
                },
                force: true, // ✅ đúng chỗ
            });
        }

        // 2) xóa 1 phần theo removedMediaIds (DB + file)
        if (!replaceAllImages && removedMediaIds.length > 0) {
            const removeList = await db.Media.findAll({
                where: {
                    media_id: removedMediaIds,
                    entity_type: "product",
                    entity_id: String(product_id),
                },
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
                force: true, // ✅ đúng chỗ
            });

            // nếu mainOldId nằm trong removedMediaIds thì bỏ mainOldId
            if (mainOldId && removedMediaIds.includes(Number(mainOldId))) {
                mainOldId = null;
            }
        }

        // 3) nếu có files mới => thêm media mới + set main theo mainIndex
        if (Array.isArray(files) && files.length > 0) {
            // set hết is_main = false trước
            await db.Media.update(
                { is_main: false },
                {
                    where: {
                        entity_type: "product",
                        entity_id: String(product_id),
                    },
                },
            );

            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                const url = `/uploadImageProducts/${f.filename}`;
                await db.Media.create({
                    entity_type: "product",
                    entity_id: String(product_id),
                    url,
                    is_main: i === Number(mainIndex),
                    alt_text: name || product.name,
                });
            }
        } else if (mainOldId) {
            // 4) không upload file mới nhưng set main là ảnh cũ
            await setMainById(mainOldId);
        } else {
            // 5) không upload + không set mainOldId
            // nếu sau khi xóa mà không còn main => auto set main = ảnh đầu tiên còn lại
            const remaining = await db.Media.findAll({
                where: {
                    entity_type: "product",
                    entity_id: String(product_id),
                },
                order: [["media_id", "ASC"]],
            });

            if (remaining.length > 0) {
                const hasMain = remaining.some((m) => !!m.is_main);
                if (!hasMain) {
                    await setMainById(remaining[0].media_id);
                }
            }
        }

        // ===== RETURN =====
        const updatedProduct = await db.Product.findByPk(product_id, {
            include: [
                { model: db.Media, as: "media" },
                { model: db.ProductCategory, as: "category" },
            ],
        });

        return {
            errCode: 0,
            errMessage: "Product updated successfully",
            product: updatedProduct,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: "Server error",
            details: e?.message || e.toString(),
        };
    }
};

// 🟢 Xóa product
let deleteProduct = async (id) => {
    let product = await db.Product.findByPk(id);
    if (!product) throw "Product not found";

    await db.ProductTranslate.destroy({ where: { product_id: id } });
    await mediaService.deleteMediaByEntity("product", id);
    await product.destroy();

    return "Product deleted successfully";
};

// 🟢 Xóa mềm
let softDeleteProduct = async (product_id) => {
    let product = await db.Product.findByPk(product_id);
    if (!product) throw "Product not found";

    await product.update({ isActive: false, isDelete: true });
    return "Product soft deleted successfully";
};

// 🟢 Xóa cứng
// 🟢 Xóa cứng (xóa file + media DB + product)
let hardDeleteProduct = async (id) => {
    const product = await db.Product.findByPk(id);
    if (!product) throw "Product not found";

    const mediaList = await db.Media.findAll({
        where: { entity_type: "product", entity_id: String(id) },
    });

    for (const m of mediaList) await safeUnlinkByUrl(m.url);

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
