"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("category", {
            category_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            parent_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "category", // self reference
                    key: "category_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
                comment: "ID danh mục cha (nếu có)",
            },
            type: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: "product",
                comment:
                    "Phân loại category, ví dụ: product, spa, hotel, service...",
            },
            status: {
                type: Sequelize.ENUM("active", "inactive"),
                defaultValue: "active",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("category");
    },
};
