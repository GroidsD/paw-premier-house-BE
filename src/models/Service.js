"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.belongsToMany(models.Appointment, {
        through: models.AppointmentServiceProduct,
        foreignKey: "serviceId",
      });
    }
  }

  Service.init(
    {
      serviceId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      description: DataTypes.TEXT,
      status: DataTypes.ENUM("active", "inactive"),
      durationMinutes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Service",
      tableName: "services",
      freezeTableName: true,
    }
  );

  return Service;
};
