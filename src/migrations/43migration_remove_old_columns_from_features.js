"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn("features", "feature_name");
        await queryInterface.removeColumn("features", "description");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("features", "feature_name", {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.addColumn("features", "description", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },
};
