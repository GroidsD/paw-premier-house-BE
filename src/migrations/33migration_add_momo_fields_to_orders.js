"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // =========================
        // Add MoMo payment fields
        // =========================

        await queryInterface.addColumn("orders", "momo_order_id", {
            type: Sequelize.STRING,
            allowNull: true,
            comment: "MoMo order ID from payment gateway",
        });

        await queryInterface.addColumn("orders", "momo_trans_id", {
            type: Sequelize.STRING,
            allowNull: true,
            comment: "MoMo transaction ID",
        });

        await queryInterface.addColumn("orders", "momo_result_code", {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: "MoMo result code (0 = success)",
        });

        await queryInterface.addColumn("orders", "momo_message", {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: "MoMo response message",
        });

        // =========================
        // Add expiration fields
        // =========================

        await queryInterface.addColumn("orders", "expires_at", {
            type: Sequelize.DATE,
            allowNull: true,
            comment: "Payment expiration time",
        });

        await queryInterface.addColumn("orders", "reserved_until", {
            type: Sequelize.DATE,
            allowNull: true,
            comment: "Reservation timeout for pending payments",
        });

        // =========================
        // Update status ENUM
        // =========================

        await queryInterface.sequelize.query(`
            ALTER TABLE orders 
            MODIFY COLUMN status ENUM(
                'pending',
                'confirmed',
                'shipping',
                'completed',
                'cancelled',
                'deleted',
                'expired'
            ) NOT NULL DEFAULT 'pending'
        `);

        // =========================
        // Update payment_status ENUM
        // =========================

        await queryInterface.sequelize.query(`
            ALTER TABLE orders 
            MODIFY COLUMN payment_status ENUM(
                'unpaid',
                'paid',
                'failed',
                'expired',
                'refunded'
            ) NOT NULL DEFAULT 'unpaid'
        `);
    },

    async down(queryInterface, Sequelize) {
        // =========================
        // Remove added columns
        // =========================

        await queryInterface.removeColumn("orders", "momo_order_id");

        await queryInterface.removeColumn("orders", "momo_trans_id");

        await queryInterface.removeColumn("orders", "momo_result_code");

        await queryInterface.removeColumn("orders", "momo_message");

        await queryInterface.removeColumn("orders", "expires_at");

        await queryInterface.removeColumn("orders", "reserved_until");

        // =========================
        // Revert status ENUM
        // =========================

        await queryInterface.sequelize.query(`
            ALTER TABLE orders 
            MODIFY COLUMN status ENUM(
                'pending',
                'confirmed',
                'shipping',
                'completed',
                'cancelled',
                'deleted'
            ) NOT NULL DEFAULT 'pending'
        `);

        // =========================
        // Revert payment_status ENUM
        // =========================

        await queryInterface.sequelize.query(`
            ALTER TABLE orders 
            MODIFY COLUMN payment_status ENUM(
                'unpaid',
                'paid',
                'failed',
                'refunded'
            ) NOT NULL DEFAULT 'unpaid'
        `);
    },
};
