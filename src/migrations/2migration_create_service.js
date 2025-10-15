"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("services", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            services_id: { type: Sequelize.STRING, unique: true },
            status: {
                type: Sequelize.ENUM("active", "inactive", "deleted"),
                defaultValue: "active",
            },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("services");
    },
};
