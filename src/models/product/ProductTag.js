"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductTag extends Model {
        static associate(models) {
            ProductTag.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
            });

            ProductTag.belongsTo(models.Tag, {
                foreignKey: "tag_id",
                as: "tag",
            });
        }
    }

    ProductTag.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            tag_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "tags",
                    key: "tag_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "ProductTag",
            tableName: "product_tags",
            freezeTableName: true,
            timestamps: false,
        }
    );

    return ProductTag;
};
