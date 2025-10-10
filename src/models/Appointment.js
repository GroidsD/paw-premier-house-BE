"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.User, { foreignKey: "customerId", as: "customer" });
      Appointment.belongsTo(models.User, { foreignKey: "staffId", as: "staff" });
      Appointment.belongsTo(models.Pet, { foreignKey: "petId", as: "pet" });
      Appointment.hasOne(models.Payment, { foreignKey: "appointmentId", as: "payment" });
      Appointment.hasMany(models.Feedback, { foreignKey: "appointmentId", as: "feedback" });
      Appointment.belongsToMany(models.Service, {
        through: models.AppointmentServiceProduct,
        foreignKey: "appointmentId",
      });
    }
  }

  Appointment.init(
    {
      appointmentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      staffId: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      petId: DataTypes.INTEGER,
      appointmentDate: DataTypes.DATE,
      status: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
      notes: DataTypes.TEXT,
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
