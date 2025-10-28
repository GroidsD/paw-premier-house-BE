"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            // 🌐 Liên kết đa ngôn ngữ
            Product.hasMany(models.ProductTranslate, {
                foreignKey: "product_id",
                as: "translations",
            });

            // 📂 Liên kết danh mục
            Product.belongsTo(models.Category, {
                foreignKey: "category_id",
                as: "category",
            });

            // 🧾 Liên kết với đơn hàng
            Product.hasMany(models.OrderItem, {
                foreignKey: "product_id",
                as: "orderItems",
            });

            // 🖼️ Liên kết với Media (đa hình - polymorphic)
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
            },

            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            status: {
                type: DataTypes.ENUM("active", "inactive", "deleted"),
                defaultValue: "active",
            },

            discount: {
                type: DataTypes.FLOAT,
                allowNull: false,
                defaultValue: 0,
                comment: "Phần trăm giảm giá (0-100)",
            },

            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Số lượng sản phẩm trong kho",
            },
        },
        {
            sequelize,
            modelName: "Product",
            tableName: "products",
            freezeTableName: true,
            timestamps: true,
        }
    );

    return Product;
};
