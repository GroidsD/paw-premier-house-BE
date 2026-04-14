"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.belongsTo(models.ProductCategory, {
                foreignKey: "productCategories_id",
                as: "category",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            Product.hasMany(models.OrderItem, {
                foreignKey: "product_id",
                as: "orderItems",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            Product.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false,
                scope: { entity_type: "product" },
                as: "media",
            });

            Product.hasMany(models.ProductVariant, {
                foreignKey: "product_id",
                as: "variants",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
            Product.hasMany(models.ProductKnowledge, {
                foreignKey: "product_id",
                as: "knowledgeItems",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    Product.init(
        {
            product_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            productCategories_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "productCategories",
                    key: "productCategories_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            summary: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            thumbnail_url: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            /*
            ====================================================
            PRODUCT VARIANT MODE
            ====================================================
            Nếu true → sản phẩm có nhiều biến thể
            Giá và tồn kho sẽ lấy từ ProductVariant
            */
            has_variants: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            /*
            ====================================================
            FALLBACK PRICE (dùng khi product không có variant)
            ====================================================
            */
            original_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },

            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                defaultValue: "percent",
            },

            price: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },

            /*
            ====================================================
            FALLBACK STOCK (dùng khi không có variant)
            ====================================================
            */
            quantity: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },

            reserved_quantity: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },

            /*
            ====================================================
            PRODUCT STATUS
            ====================================================
            */
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },

            isDelete: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },

            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Product",
            tableName: "products",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",

            hooks: {
                beforeSave: (product) => {
                    let finalPrice = Number(product.original_price || 0);
                    const discount = Number(product.discount || 0);

                    if (discount > 0) {
                        if (product.discount_type === "percent") {
                            finalPrice =
                                finalPrice - (finalPrice * discount) / 100;
                        } else {
                            finalPrice = finalPrice - discount;
                        }
                    }

                    product.price = finalPrice < 0 ? 0 : finalPrice;
                },
            },
        },
    );

    return Product;
};
