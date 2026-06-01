"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ChatMessage extends Model {
        static associate(models) {
            ChatMessage.belongsTo(models.ChatSession, {
                foreignKey: "chat_session_id",
                targetKey: "chat_session_id",
                as: "session",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    ChatMessage.init(
        {
            chat_message_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            chat_session_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            sender: {
                type: DataTypes.ENUM("user", "assistant"),
                allowNull: false,
            },

            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            intent: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            analysis_json: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            retrieval_json: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            next_action_json: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            metadata_json: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "ChatMessage",
            tableName: "chatMessages",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return ChatMessage;
};
