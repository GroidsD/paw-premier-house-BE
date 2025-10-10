"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Feedback", {
      feedbackId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      appointmentId: {
        type: Sequelize.INTEGER,
        references: { model: "Appointments", key: "appointmentId" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      customerId: {
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "userId" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      comment: Sequelize.TEXT,
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Feedback");
  },
};
