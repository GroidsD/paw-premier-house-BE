// src/services/productService.js
import db from "../models"; // hoặc const db = require("../models");

let createProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { category_id, status, translations } = data;

            let product = await db.Product.create(
                {
                    category_id,
                    status,
                    translations,
                },
                {
                    include: [
                        { model: db.ProductTranslate, as: "translations" },
                    ],
                }
            );

            resolve(product);
        } catch (e) {
            reject(e);
        }
    });
};

let getAllProducts = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let products = await db.Product.findAll({
                include: [
                    { model: db.ProductTranslate, as: "translations" },
                    {
                        model: db.Category,
                        as: "category",
                        attributes: ["category_id", "status"],
                        include: [
                            {
                                model: db.CategoryTranslate,
                                as: "translations", // phải trùng alias trong model Category
                                attributes: ["lang", "name"],
                            },
                        ],
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

let getProductById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let product = await db.Product.findByPk(id, {
                include: [
                    { model: db.ProductTranslate, as: "translations" },
                    {
                        model: db.Category,
                        as: "category",
                        attributes: ["category_id", "name"],
                    },
                ],
            });

            if (!product) {
                reject("Product not found");
            } else {
                resolve(product);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let updateProduct = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let { category_id, status, translations } = data;
            let product = await db.Product.findByPk(id);

            if (!product) {
                reject("Product not found");
            } else {
                await product.update({ category_id, status });

                if (translations && translations.length > 0) {
                    for (const t of translations) {
                        if (t.productTranslate_id) {
                            await db.ProductTranslate.update(
                                {
                                    name: t.name,
                                    description: t.description,
                                    price: t.price,
                                },
                                {
                                    where: {
                                        productTranslate_id:
                                            t.productTranslate_id,
                                    },
                                }
                            );
                        } else {
                            await db.ProductTranslate.create({
                                ...t,
                                product_id: product.product_id,
                            });
                        }
                    }
                }

                let updated = await db.Product.findByPk(id, {
                    include: [
                        { model: db.ProductTranslate, as: "translations" },
                    ],
                });
                resolve(updated);
            }
        } catch (e) {
            reject(e);
        }
    });
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

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
