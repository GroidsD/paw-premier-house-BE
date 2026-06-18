"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("productCategories", {
            productCategories_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            type_vi: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Tên loại sản phẩm (Tiếng Việt)",
            },
            type_en: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Tên loại sản phẩm (Tiếng Anh)",
            },

            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },

            isDelete: {
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
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("productCategories");
    },
};
