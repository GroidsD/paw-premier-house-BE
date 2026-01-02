"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("vouchers", {
            voucher_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },

            discount_type: {
                type: Sequelize.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
            },

            max_discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: "Giảm tối đa (áp dụng cho percent)",
            },

            min_order_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: "Giá trị đơn tối thiểu để áp dụng",
            },

            usage_limit: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: "Tổng số lần được dùng",
            },

            used_count: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            apply_for: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Áp dụng cho (ví dụ: 'all', 'new_users', ...)",
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            end_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
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
        await queryInterface.dropTable("vouchers");
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_vouchers_discount_type";'
        );
    },
};
