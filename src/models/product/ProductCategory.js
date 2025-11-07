"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductCategory extends Model {
        static associate(models) {
            // Một Category có thể có nhiều Product
            ProductCategory.hasMany(models.Product, {
                foreignKey: "productCategories_id",
                as: "products",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            // Nếu có đa ngôn ngữ (tùy chọn)
            ProductCategory.hasMany(models.ProductCategoryTranslate, {
                foreignKey: "productCategories_id",
                as: "translates",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    ProductCategory.init(
        {
            productCategories_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
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
            modelName: "ProductCategory",
            tableName: "productCategories",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return ProductCategory;
};
