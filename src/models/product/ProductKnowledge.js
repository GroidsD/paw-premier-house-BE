"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProductKnowledge extends Model {
        static associate(models) {
            ProductKnowledge.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    ProductKnowledge.init(
        {
            knowledge_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
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

            knowledge_type: {
                type: DataTypes.ENUM(
                    "benefit",
                    "usage",
                    "ingredient",
                    "warning",
                    "suitable_for",
                    "faq",
                ),
                allowNull: false,
                comment:
                    "Loại tri thức: công dụng, cách dùng, thành phần, lưu ý, đối tượng phù hợp, FAQ",
            },

            title: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Tiêu đề ngắn của nội dung tri thức",
            },

            content: {
                type: DataTypes.TEXT,
                allowNull: false,
                comment: "Nội dung tri thức chi tiết",
            },

            language: {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: "vi",
                comment: "Ngôn ngữ nội dung, ví dụ: vi, en",
            },

            sort_order: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Thứ tự ưu tiên hiển thị",
            },

            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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
            modelName: "ProductKnowledge",
            tableName: "productKnowledge",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            indexes: [
                {
                    fields: ["product_id"],
                },
                {
                    fields: ["knowledge_type"],
                },
                {
                    fields: ["language"],
                },
                {
                    fields: ["isActive"],
                },
                {
                    fields: ["product_id", "knowledge_type", "language"],
                },
            ],
        },
    );

    return ProductKnowledge;
};
