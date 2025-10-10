"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Appointments", {
      appointmentId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      customerId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "userId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      staffId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "userId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      petId: {
        type: Sequelize.INTEGER,
        references: { model: "Pets", key: "petId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      appointmentDate: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.ENUM("pending", "confirmed", "completed", "cancelled"),
        defaultValue: "pending",
      },
      notes: Sequelize.TEXT,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Appointments");
  },
};
