"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("ordersItems", {
            orderItem_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            order_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "orders", // đúng với tableName trong model Order
                    key: "order_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            product_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "products", // đúng với tableName trong model Product
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

            total_price: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },

            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("ordersItems");
    },
};
