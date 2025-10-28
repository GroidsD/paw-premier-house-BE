"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("appointments", {
      appointment_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },

      customer_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "users", // Tên bảng users
          key: "user_id",      // Khóa chính trong bảng users
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      staff_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      total_price: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },

      status: {
        type: Sequelize.ENUM("pending", "confirmed", "completed", "cancelled"),
        defaultValue: "pending",
      },

      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("appointments");
  },
};
