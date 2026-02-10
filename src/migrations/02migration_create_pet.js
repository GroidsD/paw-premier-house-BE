"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("pets", {
            pet_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },

            owner_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            species: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            gender: {
                type: Sequelize.ENUM("male", "female", "unknown"),
                defaultValue: "unknown",
            },

            status: {
                type: Sequelize.ENUM("active", "inactive", "draft"),
                defaultValue: "active",
            },

            
            pet_image: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            weight: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },

            age: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },

            breed: {
                type: Sequelize.STRING,
                allowNull: true,
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("pets");

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_pets_gender";',
        );
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_pets_status";',
        );
    },
};
