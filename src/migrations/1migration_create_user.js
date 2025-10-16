"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },

            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true,
            },

            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },

            password: {
                type: Sequelize.STRING,
                allowNull: true, // null nếu đăng nhập qua Firebase
            },

            name: {
                type: Sequelize.STRING,
            },

            gender: {
                type: Sequelize.ENUM("male", "female"),
                defaultValue: "male",
            },

            img: {
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

            role: {
                type: Sequelize.ENUM("admin", "staff", "customer"),
                allowNull: false,
                defaultValue: "customer",
            },

            status: {
                type: Sequelize.ENUM("active", "inactive"),
                defaultValue: "active",
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("users");
    },
};
