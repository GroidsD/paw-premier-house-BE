"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("serviceCategories", {
            serviceCategories_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            type: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "spa",
                comment: "Loại dịch vụ: spa, hotel, training, grooming, ...",
            },

            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },

            isDeleted: {
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
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                ),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("serviceCategories");
        await queryInterface.sequelize.query(
            "DROP TYPE IF EXISTS enum_serviceCategories_type;",
        );
    },
};
