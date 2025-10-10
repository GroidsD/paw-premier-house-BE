"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AppointmentServiceProduct", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      appointmentId: {
        type: Sequelize.INTEGER,
        references: { model: "Appointments", key: "appointmentId" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      serviceId: {
        type: Sequelize.INTEGER,
        references: { model: "Services", key: "serviceId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      productId: {
        type: Sequelize.INTEGER,
        references: { model: "Products", key: "productId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AppointmentServiceProduct");
  },
};
