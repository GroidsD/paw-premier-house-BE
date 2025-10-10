"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Appointment, { foreignKey: "appointmentId", as: "appointment" });
    }
  }

  Payment.init(
    {
      paymentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      appointmentId: DataTypes.INTEGER,
      amount: DataTypes.DECIMAL(10, 2),
      paymentMethod: DataTypes.ENUM("cash", "credit_card", "bank_transfer", "momo"),
      paymentStatus: DataTypes.ENUM("pending", "paid", "refunded"),
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      freezeTableName: true,
    }
  );

  return Payment;
};
