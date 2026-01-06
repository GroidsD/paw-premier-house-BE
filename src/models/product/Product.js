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

            /* ===== Thông tin sản phẩm ===== */
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            /* ===== Giá ===== */
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

            /* ===== Kho ===== */
            quantity: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },

            reserved_quantity: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },

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
                    let finalPrice = product.original_price;

                    if (product.discount > 0) {
                        if (product.discount_type === "percent") {
                            finalPrice -=
                                (product.original_price * product.discount) /
                                100;
                        } else {
                            finalPrice -= product.discount;
                        }
                    }

                    product.price = finalPrice < 0 ? 0 : finalPrice;
                },
            },
        }
    );

    return Product;
};
