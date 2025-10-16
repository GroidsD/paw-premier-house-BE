"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      // 1 khách hàng có nhiều lịch hẹn
      Appointment.belongsTo(models.User, { foreignKey: "customer_id", as: "customer" });

      // 1 nhân viên có thể có nhiều lịch hẹn
      Appointment.belongsTo(models.User, { foreignKey: "staff_id", as: "staff" });

      // 1 lịch hẹn có thể chứa nhiều dịch vụ
      Appointment.hasMany(models.AppointmentItem, { foreignKey: "appointment_id", as: "items" });
    }
  }

  Appointment.init(
    {

      appointment_id: {
        type: DataTypes.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
      },

      customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      staff_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      total_price: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },

      status: {
        type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
        defaultValue: "pending",
      },

      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Appointment",
      tableName: "appointments",
      freezeTableName: true,
    }
  );

  return Appointment;
};
