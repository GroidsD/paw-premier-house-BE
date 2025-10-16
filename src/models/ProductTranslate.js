"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductTranslate extends Model {
        static associate(models) {
            ProductTranslate.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
            });
        }
    }

    ProductTranslate.init(
        {
            productTranslate_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            product_id: { type: DataTypes.INTEGER, allowNull: false },
            name: DataTypes.STRING,
            description: DataTypes.TEXT,
            lang: {
                type: DataTypes.ENUM("vi", "en"),
                defaultValue: "vi",
            },
            price: DataTypes.FLOAT,
        },
        {
            sequelize,
            modelName: "ProductTranslate",
            tableName: "productTranslates",
            freezeTableName: true,
        }
    );

    return ProductTranslate;
};
