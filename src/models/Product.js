"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.hasMany(models.ProductTranslate, {
                foreignKey: "product_id",
                as: "translations",
            });
            Product.belongsTo(models.Category, {
                foreignKey: "category_id",
                as: "category",
            });
            Product.hasMany(models.OrderItem, {
                foreignKey: "product_id",
                as: "orderItems",
            });
        }
    }

    Product.init(
        {

            product_id: {
                type: DataTypes.INTEGER,
                unique: true,
                autoIncrement: true,
                primaryKey: true,
            },

            category_id: { type: DataTypes.INTEGER, allowNull: false },

            status: {
                type: DataTypes.ENUM("active", "inactive", "deleted"),
                defaultValue: "active",
            },
        },
        {
            sequelize,
            modelName: "Product",
            tableName: "products",
            freezeTableName: true,
        }
    );

    return Product;
};
