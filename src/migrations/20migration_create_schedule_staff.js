"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("schedule_staff", {
            schedule_staff_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            schedule_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "schedules",
                    key: "schedule_id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            staff_id: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            status: {
                type: Sequelize.ENUM(
                    "pending",
                    "confirmed",
                    "rejected",
                    "replaced"
                ),
                defaultValue: "pending",
            },
            replaced_by: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
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

    async down(queryInterface) {
        await queryInterface.dropTable("schedule_staff");
    },
};
