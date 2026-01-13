"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("product_tags", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            tag_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "tags",
                    key: "tag_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        // Ngăn product gắn trùng cùng 1 tag
        await queryInterface.addConstraint("product_tags", {
            fields: ["product_id", "tag_id"],
            type: "unique",
            name: "uniq_product_tag",
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("product_tags");
    },
};
