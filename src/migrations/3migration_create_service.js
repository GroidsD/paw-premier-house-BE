"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Services", {
      serviceId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      serviceName: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.TEXT,
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      duration: Sequelize.INTEGER,
      status: { type: Sequelize.ENUM("active", "inactive"), defaultValue: "active" },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Services");
  },
};
