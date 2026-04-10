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

            productVariant_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "productVariants",
                    key: "productVariant_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            product_name: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Tên sản phẩm tại thời điểm đặt hàng",
            },

            variant_label: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Tên biến thể tại thời điểm đặt hàng",
            },

            sku: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "SKU tại thời điểm đặt hàng",
            },

            product_image: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: "Ảnh sản phẩm tại thời điểm đặt hàng",
            },

            pet_weight: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Phân loại trọng lượng vật nuôi được chọn khi mua",
            },

            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },

            original_price: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá gốc của sản phẩm trong đơn (trước khi giảm giá)",
            },

            discount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá trị chiết khấu của sản phẩm",
            },

            discount_type: {
                type: Sequelize.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "fixed",
                comment: "Loại chiết khấu: percent = %, fixed = số tiền",
            },

            price: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Đơn giá sau khi áp dụng chiết khấu",
            },

            total_price: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Thành tiền của dòng sản phẩm = price * quantity",
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
