"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Feedback extends Model {
        static associate(models) {
            // Feedback thuộc về 1 user (khách hàng)
            Feedback.belongsTo(models.User, {
                foreignKey: "customer_id",
                targetKey: "user_id",
                as: "customer",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    Feedback.init(
        {
            feedback_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            customer_id: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            entity_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment:
                    "ID của đối tượng được đánh giá (product, service, pet, ...)",
            },
            entity_type: {
                type: DataTypes.ENUM("product", "service", "pet"),
                allowNull: false,
                comment: "Loại đối tượng được đánh giá",
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            rating: {
                type: DataTypes.FLOAT,
                allowNull: true,
                validate: { min: 0, max: 5 },
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
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
            modelName: "Feedback",
            tableName: "feedbacks",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Feedback;
};
