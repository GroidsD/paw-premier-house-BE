"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("chatSessions", {
            chat_session_id: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },

            user_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            guest_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            last_pet_type: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            last_product_category: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            last_product_form: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            last_recommendation_goal: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            last_product_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            last_productVariant_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "productVariants",
                    key: "productVariant_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            last_intent: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable("chatSessions");
    },
};