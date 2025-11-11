"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("schedules", {
            schedule_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            staff_id: {
                type: Sequelize.STRING,
                allowNull: false,
                references: { model: "users", key: "user_id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            work_date: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            shift_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(
                    "confirmed",
                    "pending",
                    "cancelled",
                    "replaced"
                ),
                defaultValue: "pending",
            },
            replaced_by: {
                type: Sequelize.STRING,
                allowNull: true,
                references: { model: "users", key: "user_id" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            work_status: {
                type: Sequelize.ENUM(
                    "not_started",
                    "in_progress",
                    "completed",
                    "absent"
                ),
                defaultValue: "not_started",
            },

            work_note: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("schedules");
    },
};
