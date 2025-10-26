"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("serviceTranslates", {
            serviceTranslate_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            services_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "services", // đúng với tableName trong model Service
                    key: "services_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            price: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 0,
            },

            lang: {
                type: Sequelize.ENUM("vi", "en"),
                allowNull: false,
                defaultValue: "vi",
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("serviceTranslates");
    },
};
