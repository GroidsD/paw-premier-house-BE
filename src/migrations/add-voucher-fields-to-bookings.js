"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("bookings", "original_price", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        });

        await queryInterface.addColumn("bookings", "discount", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        });

        await queryInterface.addColumn("bookings", "voucher_id", {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "vouchers",
                key: "voucher_id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("bookings", "voucher_id");
        await queryInterface.removeColumn("bookings", "discount");
        await queryInterface.removeColumn("bookings", "original_price");
    },
};
