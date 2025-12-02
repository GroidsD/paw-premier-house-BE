"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            // Mỗi Product thuộc về một Category
            Product.belongsTo(models.ProductCategory, {
                foreignKey: "productCategories_id",
                as: "category",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            // Một Product có thể nằm trong nhiều OrderItem
            Product.hasMany(models.OrderItem, {
                foreignKey: "product_id",
                as: "orderItems",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            // ProductTranslates (đa ngôn ngữ)
            Product.hasMany(models.ProductTranslate, {
                foreignKey: "product_id",
                as: "translates",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            // Media (ảnh, video,...)
            Product.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false,
                scope: {
                    entity_type: "product",
                },
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
                allowNull: false,
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

            // Giá gốc (chưa giảm)
            original_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá gốc của sản phẩm (trước khi giảm giá)",
            },

            // Chiết khấu
            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment:
                    "Giá trị chiết khấu (theo phần trăm hoặc số tiền cố định)",
            },
            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
                comment: "Loại chiết khấu: percent = %, fixed = số tiền",
            },

            // Giá sau khi giảm
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá sau khi áp dụng chiết khấu",
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
                comment: "Số lượng đã được đặt nhưng chưa confirm",
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
                    // Tính giá sau chiết khấu
                    let finalPrice = product.original_price;
                    if (product.discount && product.discount > 0) {
                        if (product.discount_type === "percent") {
                            finalPrice =
                                product.original_price -
                                (product.original_price * product.discount) /
                                    100;
                        } else if (product.discount_type === "fixed") {
                            finalPrice =
                                product.original_price - product.discount;
                        }
                    }
                    product.price = finalPrice < 0 ? 0 : finalPrice;
                },
            },
        }
    );

    return Product;
};
