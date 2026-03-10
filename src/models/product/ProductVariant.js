"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductVariant extends Model {
        static associate(models) {
            ProductVariant.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            ProductVariant.hasMany(models.OrderItem, {
                foreignKey: "productVariant_id",
                as: "orderItems",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    ProductVariant.init(
        {
            productVariant_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            sku: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },

            variant_label: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Tên hiển thị gọn của biến thể, ví dụ: Đỏ / Size M",
            },

            pet_weight: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            color: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            size: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            original_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "fixed",
            },

            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            reserved_quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
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
            modelName: "ProductVariant",
            tableName: "productVariants",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            indexes: [
                {
                    unique: true,
                    fields: ["product_id", "pet_weight", "color", "size"],
                },
            ],
            hooks: {
                beforeSave: (variant) => {
                    let finalPrice = Number(variant.original_price || 0);
                    const discount = Number(variant.discount || 0);

                    if (discount > 0) {
                        if (variant.discount_type === "percent") {
                            finalPrice =
                                finalPrice - (finalPrice * discount) / 100;
                        } else {
                            finalPrice = finalPrice - discount;
                        }
                    }

                    variant.price = finalPrice < 0 ? 0 : finalPrice;

                    if (!variant.variant_label) {
                        const parts = [
                            variant.color,
                            variant.size,
                            variant.pet_weight,
                        ].filter(Boolean);

                        variant.variant_label = parts.join(" / ") || null;
                    }
                },
            },
        },
    );

    return ProductVariant;
};
