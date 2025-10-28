"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            Category.hasMany(models.CategoryTranslate, {
                foreignKey: "category_id",
                as: "translations",
            });
            Category.hasMany(models.Product, {
                foreignKey: "category_id",
                as: "products",
            });
            Category.belongsTo(models.Category, {
                foreignKey: "parent_id",
                as: "parent",
            });
            Category.hasMany(models.Category, {
                foreignKey: "parent_id",
                as: "children",
            });
        }
    }

    Category.init(
        {
            category_id: {
                type: DataTypes.INTEGER,
                unique: true,
                autoIncrement: true,
                primaryKey: true,
            },
            parent_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "ID danh mục cha (nếu có)",
            },
            type: {
                type: DataTypes.STRING(50), // <-- thay ENUM bằng STRING
                allowNull: false,
                defaultValue: "product",
                comment:
                    "Phân loại category, ví dụ: product, spa, hotel, service...",
            },
            status: {
                type: DataTypes.ENUM("active", "inactive"),
                defaultValue: "active",
            },
        },
        {
            sequelize,
            modelName: "Category",
            tableName: "category",
            freezeTableName: true,
        }
    );

    return Category;
};
