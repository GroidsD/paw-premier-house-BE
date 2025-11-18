// src/services/productService.js
import db from "../models/index.js"; // hoặc const db = require("../models");
// let createProduct = async (data) => {
//     try {
//         let { productCategories_id, price, quantity, translates, media } = data;

//         // 1️⃣ Tạo product cùng translations
//         let product = await db.Product.create(
//             {
//                 productCategories_id,
//                 price,
//                 quantity,
//                 translates,
//             },
//             {
//                 include: [{ model: db.ProductTranslate, as: "translates" }],
//             }
//         );

//         // 2️⃣ Nếu có media, thêm media tương ứng
//         if (media && Array.isArray(media) && media.length > 0) {
//             const mediaWithEntity = media.map((item) => ({
//                 ...item,
//                 entity_id: product.product_id,
//                 entity_type: "product",
//             }));

//             await db.Media.bulkCreate(mediaWithEntity);
//         }

//         // 3️⃣ Lấy lại product có kèm media & translates
//         const productWithRelations = await db.Product.findByPk(
//             product.product_id,
//             {
//                 include: [
//                     { model: db.ProductTranslate, as: "translates" },
//                     { model: db.Media, as: "media" },
//                 ],
//             }
//         );

//         return productWithRelations;
//     } catch (e) {
//         throw e;
//     }
// };

let createProduct = async (data) => {
    try {
        const {
            productCategories_id,
            original_price,
            discount = 0,
            discount_type = "percent",
            quantity = 0,
            translates = [],
            media = [],
        } = data;

        // 1️⃣ Tạo product cùng translations
        const product = await db.Product.create(
            {
                productCategories_id,
                original_price,
                discount,
                discount_type,
                quantity,
                translates,
            },
            {
                include: [{ model: db.ProductTranslate, as: "translates" }],
            }
        );

        // 2️⃣ Nếu có media, thêm media tương ứng
        if (media.length > 0) {
            const mediaWithEntity = media.map((item) => ({
                ...item,
                entity_id: product.product_id,
                entity_type: "product",
            }));

            await db.Media.bulkCreate(mediaWithEntity);
        }

        // 3️⃣ Lấy lại product có kèm media & translates
        const productWithRelations = await db.Product.findByPk(
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
                                as: "translates", // phải trùng alias trong model Category
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
                                as: "translates", // phải trùng alias trong model Category
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

// let updateProduct = async (product_id, data) => {
//     try {
//         const {
//             productCategories_id,
//             original_price,
//             discount,
//             discount_type,
//             quantity,
//             isActive,
//             isDelete,
//             translates,
//             media,
//         } = data;

//         // 1️⃣ Tìm product
//         const product = await db.Product.findByPk(product_id);
//         if (!product) throw new Error("Product not found");
//         if (!product) {
//             resolve({
//                 errCode: 1,
//                 errMessage: "Product not found",
//                 product: null,
//             });
//         }

//         // 2️⃣ Tính price dựa trên original_price và discount
//         let finalPrice = original_price;
//         if (discount && discount > 0) {
//             if (discount_type === "percent") {
//                 finalPrice = original_price - (original_price * discount) / 100;
//             } else if (discount_type === "fixed") {
//                 finalPrice = original_price - discount;
//             }
//         }
//         finalPrice = finalPrice < 0 ? 0 : finalPrice;

//         // 3️⃣ Cập nhật dữ liệu cơ bản của product
//         await product.update({
//             productCategories_id,
//             original_price,
//             discount,
//             discount_type,
//             price: finalPrice,
//             quantity,
//             isActive,
//             isDelete,
//         });

//         // 4️⃣ Cập nhật hoặc thêm mới translations
//         if (Array.isArray(translates)) {
//             for (const t of translates) {
//                 if (t.productTranslates_id) {
//                     // Update bản dịch đã có
//                     await db.ProductTranslate.update(
//                         {
//                             name: t.name,
//                             description: t.description,
//                             language: t.language,
//                         },
//                         {
//                             where: {
//                                 productTranslates_id: t.productTranslates_id,
//                             },
//                         }
//                     );
//                 } else {
//                     // Tạo mới nếu không có productTranslates_id
//                     await db.ProductTranslate.create({
//                         product_id: product.product_id,
//                         name: t.name,
//                         description: t.description,
//                         language: t.language,
//                     });
//                 }
//             }
//         }

//         // 5️⃣ Cập nhật media
//         if (Array.isArray(media)) {
//             const ENTITY_TYPE = "product";

//             // Lấy media hiện tại
//             const existingMedia = await db.Media.findAll({
//                 where: {
//                     entity_id: product.product_id,
//                     entity_type: ENTITY_TYPE,
//                 },
//             });

//             const existingMap = new Map();
//             existingMedia.forEach((m) => existingMap.set(m.url, m));

//             for (const m of media) {
//                 if (existingMap.has(m.url)) {
//                     // Cập nhật media đã tồn tại
//                     await db.Media.update(
//                         {
//                             is_main: m.is_main,
//                             alt_text: m.alt_text,
//                         },
//                         {
//                             where: {
//                                 entity_id: product.product_id,
//                                 entity_type: ENTITY_TYPE,
//                                 url: m.url,
//                             },
//                         }
//                     );
//                     existingMap.delete(m.url);
//                 } else {
//                     // Tạo media mới
//                     await db.Media.create({
//                         ...m,
//                         entity_id: product.product_id,
//                         entity_type: ENTITY_TYPE,
//                     });
//                 }
//             }

//             // Xóa media không còn trong request
//             for (const [url] of existingMap.entries()) {
//                 await db.Media.destroy({
//                     where: {
//                         entity_id: product.product_id,
//                         entity_type: ENTITY_TYPE,
//                         url,
//                     },
//                 });
//             }
//         }

//         // 6️⃣ Lấy lại product đầy đủ với relations
//         const updatedProduct = await db.Product.findByPk(product.product_id, {
//             include: [
//                 { model: db.ProductTranslate, as: "translates" },
//                 { model: db.Media, as: "media" },
//             ],
//         });

//         return updatedProduct;
//     } catch (e) {
//         throw e;
//     }
// };

let updateProduct = async (product_id, data) => {
    try {
        const {
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

        // 1️⃣ Tìm product
        const product = await db.Product.findByPk(product_id);
        if (!product) {
            // Nếu không tìm thấy, exit luôn với thông báo
            return {
                errCode: 1,
                errMessage: "Product not found",
                product: null,
            };
        }

        // 2️⃣ Tính price dựa trên original_price và discount
        let finalPrice = original_price;
        if (discount && discount > 0) {
            if (discount_type === "percent") {
                finalPrice = original_price - (original_price * discount) / 100;
            } else if (discount_type === "fixed") {
                finalPrice = original_price - discount;
            }
        }
        finalPrice = finalPrice < 0 ? 0 : finalPrice;

        // 3️⃣ Cập nhật dữ liệu cơ bản của product
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

        // 4️⃣ Cập nhật hoặc thêm mới translations
        if (Array.isArray(translates)) {
            for (const t of translates) {
                if (t.productTranslates_id) {
                    // Update bản dịch đã có
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
                    // Tạo mới nếu không có productTranslates_id
                    await db.ProductTranslate.create({
                        product_id: product.product_id,
                        name: t.name,
                        description: t.description,
                        language: t.language,
                    });
                }
            }
        }

        // 5️⃣ Cập nhật media
        if (Array.isArray(media)) {
            const ENTITY_TYPE = "product";

            // Lấy media hiện tại
            const existingMedia = await db.Media.findAll({
                where: {
                    entity_id: product.product_id,
                    entity_type: ENTITY_TYPE,
                },
            });

            const existingMap = new Map();
            existingMedia.forEach((m) => existingMap.set(m.url, m));

            for (const m of media) {
                if (existingMap.has(m.url)) {
                    // Cập nhật media đã tồn tại
                    await db.Media.update(
                        {
                            is_main: m.is_main,
                            alt_text: m.alt_text,
                        },
                        {
                            where: {
                                entity_id: product.product_id,
                                entity_type: ENTITY_TYPE,
                                url: m.url,
                            },
                        }
                    );
                    existingMap.delete(m.url);
                } else {
                    // Tạo media mới
                    await db.Media.create({
                        ...m,
                        entity_id: product.product_id,
                        entity_type: ENTITY_TYPE,
                    });
                }
            }

            // Xóa media không còn trong request
            for (const [url] of existingMap.entries()) {
                await db.Media.destroy({
                    where: {
                        entity_id: product.product_id,
                        entity_type: ENTITY_TYPE,
                        url,
                    },
                });
            }
        }

        // 6️⃣ Lấy lại product đầy đủ với relations
        const updatedProduct = await db.Product.findByPk(product.product_id, {
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

let deleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await db.Product.findByPk(id);
            if (!product) {
                reject("Product not found");
            } else {
                await db.ProductTranslate.destroy({
                    where: { product_id: id },
                });
                await product.destroy();
                resolve("Product deleted successfully");
            }
        } catch (e) {
            reject(e);
        }
    });
};

let softDeleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await db.Product.findByPk(id);
            if (!product) return reject("Product not found");

            // Cập nhật cờ xóa mềm
            await product.update({
                isActive: false,
                isDelete: true,
            });

            resolve("Product soft deleted successfully");
        } catch (e) {
            reject(e);
        }
    });
};

let hardDeleteProduct = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await db.Product.findByPk(id);
            if (!product) return reject("Product not found");

            // 1️⃣ Xóa tất cả translations
            await db.ProductTranslate.destroy({
                where: { product_id: id },
            });

            // 2️⃣ Xóa tất cả media liên quan
            await db.Media.destroy({
                where: {
                    entity_id: id,
                    entity_type: "product",
                },
            });

            // 3️⃣ Xóa sản phẩm
            await product.destroy();

            resolve("Product hard deleted successfully");
        } catch (e) {
            reject(e);
        }
    });
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
