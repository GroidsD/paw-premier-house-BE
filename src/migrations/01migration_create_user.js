"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true,
            },

            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },

            password: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            fullname: {
                type: Sequelize.STRING,
            },

            gender: {
                type: Sequelize.ENUM("male", "female", "other"),
                defaultValue: "male",
            },

            dob: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },

            avatar: {
                type: Sequelize.STRING,
            },

            address: {
                type: Sequelize.STRING,
            },

            phone: {
                type: Sequelize.STRING,
            },

            language: {
                type: Sequelize.ENUM("vi", "en"),
                defaultValue: "vi",
            },

            auth_provider: {
                type: Sequelize.ENUM("firebase", "local"),
                allowNull: false,
                defaultValue: "firebase",
            },

            isDeleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },

            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },

            totalFeedback: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },

            feedbackScore: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },
            last_login_at: { type: Sequelize.DATE },
            last_seen_at: { type: Sequelize.DATE },

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
        await queryInterface.dropTable("users");
    },
};
