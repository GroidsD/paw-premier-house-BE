"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("chatMessages", {
            chat_message_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            chat_session_id: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "chatSessions",
                    key: "chat_session_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            sender: {
                type: Sequelize.ENUM("user", "assistant"),
                allowNull: false,
            },

            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            intent: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            analysis_json: {
                type: Sequelize.JSON,
                allowNull: true,
            },

            retrieval_json: {
                type: Sequelize.JSON,
                allowNull: true,
            },

            next_action_json: {
                type: Sequelize.JSON,
                allowNull: true,
            },

            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("chatMessages");
    },
};