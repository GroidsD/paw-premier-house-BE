"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("services", "name_vi", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("services", "name_en", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("services", "description_vi", {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        });

        await queryInterface.addColumn("services", "description_en", {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("services", "name_vi");
        await queryInterface.removeColumn("services", "name_en");
        await queryInterface.removeColumn("services", "description_vi");
        await queryInterface.removeColumn("services", "description_en");
    },
};
