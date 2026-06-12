"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn("products", "name");
        await queryInterface.removeColumn("products", "summary");
        await queryInterface.removeColumn("products", "description");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("products", "name", {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.addColumn("products", "summary", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("products", "description", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
};
