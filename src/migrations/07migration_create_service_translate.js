"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("serviceTranslates", {
            serviceTranslates_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            service_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "services", // bảng trong DB
                    key: "service_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            language: {
                type: Sequelize.ENUM("vi", "en"),
                allowNull: false,
                defaultValue: "vi",
                comment: "Ngôn ngữ: vi (Vietnamese), en (English)",
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
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("serviceTranslates");
        await queryInterface.sequelize.query(
            "DROP TYPE IF EXISTS enum_serviceTranslates_lang;"
        );
    },
};
