"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("products", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            product_id: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            category_id: { type: Sequelize.INTEGER, allowNull: false },
            status: {
                type: Sequelize.ENUM("active", "inactive", "deleted"),
                defaultValue: "active",
            },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("products");
    },
};
