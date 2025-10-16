"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("orders", {
            order_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },

            customer_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: "users", // tên bảng users (chữ thường, khớp với User.tableName)
                    key: "user_id", // khóa chính trong bảng users
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            total_price: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },

            status: {
                type: Sequelize.ENUM(
                    "pending",
                    "paid",
                    "cancelled",
                    "shipped",
                    "completed"
                ),
                defaultValue: "pending",
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
        await queryInterface.dropTable("orders");
    },
};
