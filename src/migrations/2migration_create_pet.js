"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Pets", {
            petId: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: { type: Sequelize.STRING, allowNull: false },
            species: Sequelize.STRING,
            breed: Sequelize.STRING,
            gender: Sequelize.ENUM("male", "female"),
            birthDate: Sequelize.DATEONLY,
            note: Sequelize.TEXT,
            customerId: {
                type: Sequelize.INTEGER,
                references: { model: "Users", key: "userId" },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Pets");
    },
};
