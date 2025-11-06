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

            // Nếu bạn có ProductTranslates (đa ngôn ngữ)
            Product.hasMany(models.ProductTranslate, {
                foreignKey: "product_id",
                as: "translates",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
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
                    model: "productCategories", // bảng thật trong DB
                    key: "productCategories_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
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
        }
    );

    return Product;
};
