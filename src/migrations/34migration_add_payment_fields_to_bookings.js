"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("bookings", "payment_method", {
            type: Sequelize.ENUM("SHOP", "MOMO"),
            allowNull: false,
            defaultValue: "SHOP",
            comment: "Booking payment method",
        });

        await queryInterface.addColumn("bookings", "payment_status", {
            type: Sequelize.ENUM("unpaid", "paid", "failed", "expired"),
            allowNull: false,
            defaultValue: "unpaid",
            comment: "Booking payment status",
        });

        await queryInterface.addColumn("bookings", "momo_order_id", {
            type: Sequelize.STRING,
            allowNull: true,
            comment: "MoMo order ID from payment gateway",
        });

        await queryInterface.addColumn("bookings", "momo_trans_id", {
            type: Sequelize.STRING,
            allowNull: true,
            comment: "MoMo transaction ID",
        });

        await queryInterface.addColumn("bookings", "momo_result_code", {
            type: Sequelize.STRING,
            allowNull: true,
            comment: "MoMo result code",
        });

        await queryInterface.addColumn("bookings", "momo_message", {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: "MoMo response message",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("bookings", "momo_message");
        await queryInterface.removeColumn("bookings", "momo_result_code");
        await queryInterface.removeColumn("bookings", "momo_trans_id");
        await queryInterface.removeColumn("bookings", "momo_order_id");
        await queryInterface.removeColumn("bookings", "payment_status");
        await queryInterface.removeColumn("bookings", "payment_method");

        if (queryInterface.sequelize.options.dialect === "postgres") {
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_bookings_payment_method";',
            );
            await queryInterface.sequelize.query(
                'DROP TYPE IF EXISTS "enum_bookings_payment_status";',
            );
        }
    },
};
