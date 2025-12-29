"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("bookings", {
            booking_id: {
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

            staff_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            pet_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "pets",
                    key: "pet_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
            },

            status: {
                type: Sequelize.ENUM("pending", "approved", "rejected"),
                defaultValue: "pending",
            },

            date: {
                type: Sequelize.DATE,
                allowNull: false,
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
        await queryInterface.dropTable("bookings");
    },
};
