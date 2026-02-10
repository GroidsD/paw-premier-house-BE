"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("feedbacks", {
            feedback_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            customer_id: {
                type: Sequelize.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            entity_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment:
                    "ID của đối tượng được đánh giá (product, service, pet, ...)",
            },

            entity_type: {
                type: Sequelize.ENUM("product", "service", "pet"),
                allowNull: false,
                comment: "Loại đối tượng được đánh giá",
            },

            content: {
                type: Sequelize.TEXT,
                allowNull: true,
            },

            rating: {
                type: Sequelize.FLOAT,
                allowNull: true,
                validate: { min: 0, max: 5 },
            },

            image: {
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
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("feedbacks");
    },
};
