"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("features", "feature_name_vi", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("features", "feature_name_en", {
            type: Sequelize.STRING(255),
            allowNull: true,
        });

        await queryInterface.addColumn("features", "description_vi", {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        });

        await queryInterface.addColumn("features", "description_en", {
            type: Sequelize.TEXT("long"),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("features", "feature_name_vi");
        await queryInterface.removeColumn("features", "feature_name_en");
        await queryInterface.removeColumn("features", "description_vi");
        await queryInterface.removeColumn("features", "description_en");
    },
};
