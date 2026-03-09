"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("features", {
            feature_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
                comment: "Khóa chính của feature",
            },

            feature_name: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Tên feature",
            },

            serviceCategories_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: "Category của feature (spa, hotel, ...)",
                references: {
                    model: "serviceCategories",
                    key: "serviceCategories_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            icon: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Icon của feature",
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: "Mô tả feature",
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                ),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("features");
    },
};
