"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("voucher_usages", {
            voucher_usage_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            voucher_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "vouchers",
                    key: "voucher_id",
                },
                onDelete: "CASCADE",
            },

            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onDelete: "CASCADE",
            },

            booking_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "bookings",
                    key: "booking_id",
                },
                onDelete: "SET NULL",
            },

            order_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "orders",
                    key: "order_id",
                },
                onDelete: "SET NULL",
            },
            discount_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM("used", "refunded"),
                defaultValue: "used",
            },

            used_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            refunded_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });

        await queryInterface.addConstraint("voucher_usages", {
            fields: ["voucher_id", "user_id"],
            type: "unique",
            name: "unique_user_voucher",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("voucher_usages");
    },
};
