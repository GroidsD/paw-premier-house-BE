"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      paymentId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      appointmentId: {
        type: Sequelize.INTEGER,
        references: { model: "Appointments", key: "appointmentId" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      paymentMethod: {
        type: Sequelize.ENUM("cash", "credit_card", "bank_transfer", "momo"),
        allowNull: false,
      },
      paymentStatus: {
        type: Sequelize.ENUM("pending", "paid", "refunded"),
        defaultValue: "pending",
      },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Payments");
  },
};
