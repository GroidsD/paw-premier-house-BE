"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("services", {
            service_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            serviceCategories_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "serviceCategories",
                    key: "serviceCategories_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 60,
                comment: "Duration in minutes",
            },

            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },

            isDeleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },

            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                ),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("services");
    },
};
