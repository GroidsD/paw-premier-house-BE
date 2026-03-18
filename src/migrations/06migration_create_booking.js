"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("bookings", {
            booking_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            booking_code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
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

            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            check_in: {
                type: Sequelize.DATE,
                allowNull: true,
            },

            check_out: {
                type: Sequelize.DATE,
                allowNull: true,
            },

            check_in_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },

            check_out_date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
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
                    "completed",
                ),
                defaultValue: "pending",
            },

            cancelled_by: {
                type: Sequelize.ENUM("customer", "staff", "system"),
                allowNull: true,
            },

            cancel_reason: {
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
        await queryInterface.dropTable("bookings");
    },
};
