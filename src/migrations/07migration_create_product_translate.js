"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("productTranslates", {
            productTranslate_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
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
            name: {
                type: Sequelize.STRING,
            },
            description: {
                type: Sequelize.TEXT,
            },
            lang: {
                type: Sequelize.ENUM("vi", "en"),
                defaultValue: "vi",
            },
            price: {
                type: Sequelize.FLOAT,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("productTranslates");
    },
};
