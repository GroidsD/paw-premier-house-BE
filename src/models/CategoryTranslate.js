"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class CategoryTranslate extends Model {
        static associate(models) {
            CategoryTranslate.belongsTo(models.Category, {
                foreignKey: "category_id",
                as: "category",
            });
        }
    }

    CategoryTranslate.init(
        {
            categoryTranslate_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            category_id: { type: DataTypes.INTEGER, allowNull: false },
            name: DataTypes.STRING,
            lang: {
                type: DataTypes.ENUM("vi", "en"),
                defaultValue: "vi",
            },
        },
        {
            sequelize,
            modelName: "CategoryTranslate",
            tableName: "categoryTranslates",
            freezeTableName: true,
        }
    );

    return CategoryTranslate;
};
