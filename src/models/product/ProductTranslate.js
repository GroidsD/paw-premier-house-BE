"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductTranslate extends Model {
        static associate(models) {
            // Mỗi bản dịch thuộc về một sản phẩm
            ProductTranslate.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    ProductTranslate.init(
        {
            productTranslates_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products", // tên bảng thật trong DB
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            modelName: "ProductTranslate",
            tableName: "productTranslates",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return ProductTranslate;
};
