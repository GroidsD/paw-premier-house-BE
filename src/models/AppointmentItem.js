"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AppointmentItem extends Model {
    static associate(models) {
      AppointmentItem.belongsTo(models.Appointment, { foreignKey: "appointment_id", as: "appointment" });
      AppointmentItem.belongsTo(models.Service, { foreignKey: "service_id", as: "service" });
    }
  }

  AppointmentItem.init(
    {
      appointmentItem_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      appointment_id: { type: DataTypes.INTEGER, allowNull: false },
      service_id: { type: DataTypes.INTEGER, allowNull: false },
      total_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "AppointmentItem",
      tableName: "appointmentsItems",
      freezeTableName: true,
    }
  );

  return AppointmentItem;
};
