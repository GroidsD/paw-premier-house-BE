"use strict";
/** @type {import('sequelize-cli').Migration} */ module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("bookings", {
            booking_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            customer_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: { model: "users", key: "user_id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            staff_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: { model: "users", key: "user_id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            pet_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: "pets", key: "pet_id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            original_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            voucher_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: "vouchers", key: "voucher_id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            status: {
                type: Sequelize.ENUM(
                    "pending",
                    "assigned",
                    "cancelled",
                    "completed"
                ),
                defaultValue: "pending",
            },
            /* 🔥 chuẩn bị cho refund voucher */
            cancelled_by: {
                type: Sequelize.ENUM("customer", "staff", "system"),
                allowNull: true,
            },
            cancel_reason: { type: Sequelize.STRING, allowNull: true },
            date: { type: Sequelize.DATE, allowNull: false },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("bookings");
    },
};
