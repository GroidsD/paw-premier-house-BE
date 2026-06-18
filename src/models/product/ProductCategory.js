"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductCategory extends Model {
        static associate(models) {
            ProductCategory.hasMany(models.Product, {
                foreignKey: "productCategories_id",
                as: "products",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    ProductCategory.init(
        {
            productCategories_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            type_vi: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Tên loại sản phẩm (Tiếng Việt)",
            },
            type_en: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Tên loại sản phẩm (Tiếng Anh)",
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
        },
    );

    return ProductCategory;
};
