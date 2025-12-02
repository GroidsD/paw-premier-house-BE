import db from "../models/index.js";
import mediaService from "./MediaService.js"; // import MediaService

// 🟢 Tạo product mới
let createProduct = async (data) => {
    try {
        let {
            productCategories_id,
            original_price,
            discount = 0,
            discount_type = "percent",
            quantity = 0,
            translates = [],
            media = [],
        } = data;

        // 1️⃣ Tạo product cùng translations
        let product = await db.Product.create(
            {
                productCategories_id,
                original_price,
                discount,
                discount_type,
                quantity,
                translates,
            },
            { include: [{ model: db.ProductTranslate, as: "translates" }] }
        );

        // 2️⃣ Tạo media thông qua MediaService
        await mediaService.createMediaForEntity(
            media,
            product.product_id,
            "product"
        );

        // 3️⃣ Lấy lại product có kèm media & translates
        let productWithRelations = await db.Product.findByPk(
            product.product_id,
            {
                include: [
                    { model: db.ProductTranslate, as: "translates" },
                    { model: db.Media, as: "media" },
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

// 🟢 Lấy tất cả product
let getAllProducts = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let products = await db.Product.findAll({
                attributes: [
                    "product_id",
                    "productCategories_id",
                    "price",
                    "quantity",
                    "isActive",
                ],
                include: [
                    {
                        model: db.ProductTranslate,
                        as: "translates",
                        attributes: [
                            "product_id",
                            "name",
                            "description",
                            "language",
                        ],
                    },
                    {
                        model: db.ProductCategory,
                        as: "category",
                        attributes: [
                            "productCategories_id",
                            "isActive",
                            "isDelete",
                        ],
                        include: [
                            {
                                model: db.ProductCategoryTranslate,
                                as: "translates",
                                attributes: ["language", "type"],
                            },
                        ],
                    },
                    { model: db.Media, as: "media" },
                ],
                order: [["product_id", "ASC"]],
            });
            resolve(products);
        } catch (e) {
            reject(e);
        }
    });
};

// 🟢 Lấy product theo ID
let getProductById = (product_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await db.Product.findByPk(product_id, {
                include: [
                    { model: db.ProductTranslate, as: "translates" },
                    {
                        model: db.ProductCategory,
                        as: "category",
                        attributes: [
                            "productCategories_id",
                            "isActive",
                            "isDelete",
                        ],
                        include: [
                            {
                                model: db.ProductCategoryTranslate,
                                as: "translates",
                                attributes: ["language", "type"],
                            },
                        ],
                    },
                    { model: db.Media, as: "media" },
                ],
            });

            if (!product) {
                resolve({
                    errCode: 1,
                    errMessage: "Product not found",
                    product: null,
                });
            } else {
                resolve({
                    errCode: 0,
                    errMessage: "Product retrieved successfully",
                    product,
                });
            }
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
            original_price,
            discount,
            discount_type,
            quantity,
            isActive,
            isDelete,
            translates,
            media,
        } = data;

        let product = await db.Product.findByPk(product_id);
        if (!product)
            return {
                errCode: 1,
                errMessage: "Product not found",
                product: null,
            };

        // Tính giá finalPrice
        let finalPrice = original_price;
        if (discount && discount > 0) {
            finalPrice =
                discount_type === "percent"
                    ? original_price - (original_price * discount) / 100
                    : original_price - discount;
        }
        finalPrice = finalPrice < 0 ? 0 : finalPrice;

        // Update product cơ bản
        await product.update({
            productCategories_id,
            original_price,
            discount,
            discount_type,
            price: finalPrice,
            quantity,
            isActive,
            isDelete,
        });

        // Cập nhật translations
        if (Array.isArray(translates)) {
            for (let t of translates) {
                if (t.productTranslates_id) {
                    await db.ProductTranslate.update(
                        {
                            name: t.name,
                            description: t.description,
                            language: t.language,
                        },
                        {
                            where: {
                                productTranslates_id: t.productTranslates_id,
                            },
                        }
                    );
                } else {
                    await db.ProductTranslate.create({
                        product_id: product.product_id,
                        name: t.name,
                        description: t.description,
                        language: t.language,
                    });
                }
            }
        }

        // Cập nhật media thông qua MediaService
        if (Array.isArray(media)) {
            await mediaService.updateMediaForEntity(
                media,
                product.product_id,
                "product"
            );
        }

        let updatedProduct = await db.Product.findByPk(product.product_id, {
            include: [
                { model: db.ProductTranslate, as: "translates" },
                { model: db.Media, as: "media" },
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

    await db.ProductTranslate.destroy({ where: { product_id: id } });
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
