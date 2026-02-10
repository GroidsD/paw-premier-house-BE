"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("UserRecommendations", {
            recommendation_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            entity_type: {
                type: Sequelize.ENUM("products", "pets", "users", "services"),
                allowNull: false,
            },
            entity_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            score: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },
            recommendation_reason: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            algorithm_type: {
                type: Sequelize.STRING,
                allowNull: true,
                comment:
                    "Thuật toán tạo gợi ý (rule_based, collaborative, AI, ...)",
            },
            valid_until: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: "Ngày hết hạn của gợi ý",
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
        await queryInterface.dropTable("UserRecommendations");
    },
};
