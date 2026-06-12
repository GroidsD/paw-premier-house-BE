"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn("services", "name");
        await queryInterface.removeColumn("services", "description");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("services", "name", {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.addColumn("services", "description", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
};
