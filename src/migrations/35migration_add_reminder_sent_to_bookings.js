"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("bookings", "reminder_sent", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "Whether the booking reminder email has been sent",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("bookings", "reminder_sent");
    },
};
