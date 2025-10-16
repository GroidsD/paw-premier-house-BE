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
