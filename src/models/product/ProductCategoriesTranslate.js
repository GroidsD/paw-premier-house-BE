"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductCategoryTranslate extends Model {
        static associate(models) {
            // Mỗi bản dịch thuộc về một Category
            ProductCategoryTranslate.belongsTo(models.ProductCategory, {
                foreignKey: "productCategories_id",
                as: "category",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    ProductCategoryTranslate.init(
        {
            productCategoriesTranslates_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            productCategories_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "productCategories",
                    key: "productCategories_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Tên loại sản phẩm (theo ngôn ngữ)",
            },
            language: {
                type: DataTypes.ENUM("vi", "en"),
                allowNull: false,
                defaultValue: "vi",
                comment: "Ngôn ngữ của bản dịch (vi hoặc en)",
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
            modelName: "ProductCategoryTranslate",
            tableName: "productCategoriesTranslates",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return ProductCategoryTranslate;
};
