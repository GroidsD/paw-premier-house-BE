"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      productId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      productName: { type: Sequelize.STRING, allowNull: false },
      description: Sequelize.TEXT,
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      type: Sequelize.STRING,
      status: { type: Sequelize.ENUM("active", "inactive"), defaultValue: "active" },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  },
};
