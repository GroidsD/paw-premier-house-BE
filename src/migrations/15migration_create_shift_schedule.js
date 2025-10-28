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
            work_date_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "workdates", key: "work_date_id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            shift_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "shifts", key: "shift_id" },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            status: {
                type: Sequelize.ENUM("confirmed", "cancelled", "replaced"),
                defaultValue: "confirmed",
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
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("schedules");
    },
};
