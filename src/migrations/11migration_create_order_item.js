"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("orderItems", {
            orderItem_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "orders",
                    key: "order_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            product_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },

            original_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá gốc của sản phẩm trong đơn (trước khi giảm giá)",
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

            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá sau khi áp dụng chiết khấu",
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
        await queryInterface.dropTable("orderItems");

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_orderItems_discount_type";',
        );
    },
};
