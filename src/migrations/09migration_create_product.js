"use strict";


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

            
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },

            
            original_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
            },

            discount_type: {
                type: Sequelize.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
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
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("products");

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_products_discount_type";',
        );
    },
};
