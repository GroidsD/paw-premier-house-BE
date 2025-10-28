"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("shift_requests", {
            shift_request_id: {
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
                type: Sequelize.ENUM("pending", "approved", "rejected"),
                defaultValue: "pending",
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
        await queryInterface.dropTable("shift_requests");
    },
};
