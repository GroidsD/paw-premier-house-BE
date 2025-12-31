"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("voucherUsages", {
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
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            order_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "orders",
                    key: "order_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            booking_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "bookings",
                    key: "booking_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            used_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("voucher_usages");
    },
};
