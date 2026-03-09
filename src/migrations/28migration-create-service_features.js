"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("service_features", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
                comment: "Khóa chính",
            },

            service_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: "Service sử dụng feature",
                references: {
                    model: "services",
                    key: "service_id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            feature_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: "Feature được gắn vào service",
                references: {
                    model: "features",
                    key: "feature_id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("service_features");
    },
};
