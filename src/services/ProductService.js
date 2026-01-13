import db from "../models/index.js";
import { generateSlug } from "../utils/slug.js";
import mediaService from "./MediaService.js"; // import MediaService

// 🟢 Tạo product mới
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
            tags = [], // 👈 thêm tag từ FE
        } = data;

        /* =======================
           1️⃣ Tạo slug cho product
        ======================= */
        let baseSlug = generateSlug(name);
        let slug = baseSlug;
        let count = 1;

        // tránh trùng slug
        while (await db.Product.findOne({ where: { slug } })) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        /* =======================
           2️⃣ Tạo product
        ======================= */
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

        /* =======================
           3️⃣ Tạo media
        ======================= */
        await mediaService.createMediaForEntity(
            media,
            product.product_id,
            "product"
        );

        /* =======================
           4️⃣ Xử lý tag
        ======================= */
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

        /* =======================
           5️⃣ Lấy lại product đầy đủ
        ======================= */
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
            }
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
                    "slug", // 👈 thêm slug
                    "price",
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

// 🟢 Cập nhật product
let updateProduct = async (product_id, data) => {
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
            media,
        } = data;

        let product = await db.Product.findByPk(product_id);
        if (!product) {
            return {
                errCode: 1,
                errMessage: "Product not found",
                product: null,
            };
        }

        // ⚠️ fallback giá cũ nếu không gửi
        let basePrice =
            original_price !== undefined
                ? original_price
                : product.original_price;

        let finalPrice = basePrice;

        if (discount > 0) {
            finalPrice =
                discount_type === "percent"
                    ? basePrice - (basePrice * discount) / 100
                    : basePrice - discount;
        }

        finalPrice = finalPrice < 0 ? 0 : finalPrice;

        // ✅ Update product
        await product.update({
            productCategories_id,
            name,
            description,
            original_price: basePrice,
            discount,
            discount_type,
            price: finalPrice,
            quantity,
            isActive,
            isDelete,
        });

        // ✅ Update media
        if (Array.isArray(media)) {
            await mediaService.updateMediaForEntity(
                media,
                product.product_id,
                "product"
            );
        }

        let updatedProduct = await db.Product.findByPk(product.product_id, {
            include: [{ model: db.Media, as: "media" }],
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
            details: e.toString(),
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
let softDeleteProduct = async (id) => {
    let product = await db.Product.findByPk(id);
    if (!product) throw "Product not found";

    await product.update({ isActive: false, isDelete: true });
    return "Product soft deleted successfully";
};

// 🟢 Xóa cứng
let hardDeleteProduct = async (id) => {
    let product = await db.Product.findByPk(id);
    if (!product) throw "Product not found";

    await db.Product.destroy({ where: { product_id: id } });
    await mediaService.deleteMediaByEntity("product", id);
    await product.destroy();

    return "Product hard deleted successfully";
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
