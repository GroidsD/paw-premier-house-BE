"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            user_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: { type: Sequelize.STRING, allowNull: false, unique: true },
            password: { type: Sequelize.STRING, allowNull: true },
            name: Sequelize.STRING,
            gender: {
                type: Sequelize.ENUM("male", "female"),
                defaultValue: "male",
            },
            img: Sequelize.STRING,
            address: Sequelize.STRING,
            phone: Sequelize.STRING,
            language: { type: Sequelize.ENUM("vi", "en"), defaultValue: "vi" },
            role: {
                type: Sequelize.ENUM("admin", "staff", "customer"),
                allowNull: false,
                defaultValue: "customer",
            },
            status: {
                type: Sequelize.ENUM("active", "inactive", "banned"),
                defaultValue: "active",
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("users");
    },
};
