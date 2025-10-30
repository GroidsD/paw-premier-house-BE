"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("products", {
            product_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                unique: true,
                allowNull: false,
                primaryKey: true,
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM("active", "inactive", "deleted"),
                defaultValue: "active",
            },
            discount: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0,
                comment: "Phần trăm giảm giá (0-100)",
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Số lượng sản phẩm trong kho",
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
        await queryInterface.dropTable("products");
    },
};
