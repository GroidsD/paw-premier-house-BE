"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("bookingItems", {
            bookingItem_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            booking_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "bookings",
                    key: "booking_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            service_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "services",
                    key: "service_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
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
        await queryInterface.dropTable("bookingItems");
    },
};
