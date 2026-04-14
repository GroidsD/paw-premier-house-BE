"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("productVariants", {
            productVariant_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            sku: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },

            variant_label: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Tên hiển thị gọn của biến thể, ví dụ: Đỏ / Size M",
            },

            pet_weight: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            color: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            size: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            thumbnail_url: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            original_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount_type: {
                type: Sequelize.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "fixed",
            },

            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            reserved_quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            isActive: {
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
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                ),
            },
        });

        await queryInterface.addIndex("productVariants", {
            fields: ["product_id", "pet_weight", "color", "size"],
            unique: true,
            name: "product_variants_unique_combination",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            "productVariants",
            "product_variants_unique_combination",
        );
        await queryInterface.dropTable("productVariants");
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_productVariants_discount_type";',
        );
    },
};
