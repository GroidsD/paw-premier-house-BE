"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("petsTranslates", {
            petTranslate_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            pet_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "pets", // bảng cha
                    key: "pet_id",
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

            species: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            gender: {
                type: Sequelize.ENUM("male", "female", "unknown"),
                defaultValue: "unknown",
            },

            language: {
                type: Sequelize.ENUM("vi", "en"),
                allowNull: false,
                defaultValue: "vi",
            },

            status: {
                type: Sequelize.ENUM("active", "inactive", "draft"),
                defaultValue: "active",
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

        //  Ràng buộc: mỗi pet chỉ có 1 bản dịch cho mỗi ngôn ngữ
        await queryInterface.addConstraint("petsTranslates", {
            fields: ["pet_id", "language"],
            type: "unique",
            name: "unique_pet_language_constraint",
        });
    },

    async down(queryInterface, Sequelize) {
        // Xóa constraint trước khi drop table (nếu không sẽ lỗi)
        await queryInterface.removeConstraint(
            "petsTranslates",
            "unique_pet_language_constraint"
        );

        await queryInterface.dropTable("petsTranslates");
    },
};
