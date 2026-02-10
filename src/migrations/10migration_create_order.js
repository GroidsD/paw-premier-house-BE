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

            original_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng giá trị gốc của đơn hàng (trước khi giảm giá)",
            },

            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment:
                    "Giá trị chiết khấu (theo phần trăm hoặc số tiền cố định)",
            },

            discount_type: {
                type: Sequelize.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
                comment: "Loại chiết khấu: percent = %, fixed = số tiền",
            },

            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng giá trị đơn hàng sau khi áp dụng chiết khấu",
            },

            status: {
                type: Sequelize.ENUM(
                    "pending",
                    "confirmed",
                    "shipped",
                    "completed",
                    "cancelled",
                ),
                allowNull: false,
                defaultValue: "pending",
                comment:
                    "Trạng thái đơn hàng: pending, confirmed, shipped, completed, cancelled",
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
    },
};
