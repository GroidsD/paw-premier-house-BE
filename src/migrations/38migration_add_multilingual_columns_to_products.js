"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("products", "name_vi", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("products", "name_en", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("products", "summary_vi", {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        await queryInterface.addColumn("products", "summary_en", {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        await queryInterface.addColumn("products", "description_vi", {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        });

        await queryInterface.addColumn("products", "description_en", {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("products", "name_vi");
        await queryInterface.removeColumn("products", "name_en");
        await queryInterface.removeColumn("products", "summary_vi");
        await queryInterface.removeColumn("products", "summary_en");
        await queryInterface.removeColumn("products", "description_vi");
        await queryInterface.removeColumn("products", "description_en");
    },
};
