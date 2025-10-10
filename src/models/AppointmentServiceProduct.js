"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AppointmentServiceProduct extends Model {
    static associate(models) {}
  }

  AppointmentServiceProduct.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      appointmentId: DataTypes.INTEGER,
      serviceId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "AppointmentServiceProduct",
      tableName: "appointment_services_product",
      freezeTableName: true,
    }
  );

  return AppointmentServiceProduct;
};
