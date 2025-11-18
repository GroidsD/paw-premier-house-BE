"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("products", {
            product_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            productCategories_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "productCategories",
                    key: "productCategories_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            // Giá gốc
            original_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá gốc của sản phẩm (trước khi giảm giá)",
            },

            // Giá trị chiết khấu
            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment:
                    "Giá trị chiết khấu (theo phần trăm hoặc số tiền cố định)",
            },

            // Loại chiết khấu
            discount_type: {
                type: Sequelize.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
                comment: "Loại chiết khấu: percent = %, fixed = số tiền",
            },

            // Giá sau khi giảm
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá sau khi áp dụng chiết khấu",
            },

            // Số lượng tồn kho
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            reserved_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Số lượng đã được đặt nhưng chưa confirm",
            },

            // Cờ hoạt động
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },

            // Cờ xóa mềm
            isDelete: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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
        await queryInterface.dropTable("products");

        // Dọn ENUM để tránh lỗi khi migrate lại
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_products_discount_type";'
        );
    },
};
