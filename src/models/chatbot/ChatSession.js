"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
    class ChatSession extends Model {
        static associate(models) {
            ChatSession.belongsTo(models.User, {
                foreignKey: "user_id",
                targetKey: "user_id",
                as: "user",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            ChatSession.hasMany(models.ChatMessage, {
                foreignKey: "chat_session_id",
                as: "messages",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            ChatSession.belongsTo(models.Product, {
                foreignKey: "last_product_id",
                as: "lastProduct",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            ChatSession.belongsTo(models.ProductVariant, {
                foreignKey: "last_productVariant_id",
                as: "lastVariant",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
            ChatSession.belongsTo(models.Service, {
                foreignKey: "last_service_id",
                as: "lastService",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    ChatSession.init(
        {
            chat_session_id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },

            user_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            guest_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            last_pet_type: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            last_product_category: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            last_product_form: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            last_recommendation_goal: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            last_product_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            last_productVariant_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            last_product_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            last_service_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            last_service_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            last_shown_product_ids: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            last_shown_service_ids: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            last_search_filters: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            last_intent: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "ChatSession",
            tableName: "chatSessions",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return ChatSession;
};
