"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("productKnowledge", {
            knowledge_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            knowledge_type: {
                type: Sequelize.ENUM(
                    "benefit",
                    "usage",
                    "ingredient",
                    "warning",
                    "suitable_for",
                    "faq",
                ),
                allowNull: false,
            },

            title: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            language: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: "vi",
            },

            sort_order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        await queryInterface.addIndex("productKnowledge", ["product_id"]);
        await queryInterface.addIndex("productKnowledge", ["knowledge_type"]);
        await queryInterface.addIndex("productKnowledge", ["language"]);
        await queryInterface.addIndex("productKnowledge", ["isActive"]);
        await queryInterface.addIndex("productKnowledge", [
            "product_id",
            "knowledge_type",
            "language",
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("productKnowledge");
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_productKnowledge_knowledge_type";',
        );
    },
};
