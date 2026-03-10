"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("orders", {
            order_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            customer_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            receiver_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            receiver_phone: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            receiver_province: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            receiver_district: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            receiver_address: {
                type: Sequelize.TEXT,
                allowNull: false,
            },

            note: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            payment_method: {
                type: Sequelize.ENUM("COD", "BANK", "WALLET", "CARD"),
                allowNull: false,
                defaultValue: "COD",
            },

            voucher_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            original_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng giá trị gốc của đơn hàng trước giảm giá",
            },

            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment: "Giá trị giảm giá của đơn hàng",
            },

            discount_type: {
                type: Sequelize.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "fixed",
                comment: "Loại giảm giá: percent hoặc fixed",
            },

            shipping_fee: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Phí vận chuyển",
            },

            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng thanh toán cuối cùng của đơn hàng",
            },

            status: {
                type: Sequelize.ENUM(
                    "pending",
                    "confirmed",
                    "shipped",
                    "completed",
                    "cancelled",
                    "deleted",
                ),
                allowNull: false,
                defaultValue: "pending",
                comment:
                    "Trạng thái đơn hàng: pending, confirmed, shipped, completed, cancelled, deleted",
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
        await queryInterface.dropTable("orders");

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_orders_status";',
        );
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_orders_discount_type";',
        );
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_orders_payment_method";',
        );
    },
};
