"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("schedules", {
            schedule_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            work_date: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            shift_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "shifts",
                    key: "shift_id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            status: {
                type: Sequelize.ENUM("open", "closed"),
                defaultValue: "open",
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

            max_people: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
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
        await queryInterface.dropTable("schedules");
    },
};
