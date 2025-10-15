"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.hasMany(models.ServiceTranslate, { foreignKey: "services_id", as: "translations" });
      Service.hasMany(models.AppointmentItem, { foreignKey: "service_id", as: "appointmentItems" });
    }
  }

  Service.init(
    {
      // id: { type: DataTypes.INTEGER,},
      services_id: { type: DataTypes.STRING, unique: true , autoIncrement: true, primaryKey: true },
      status: {
        type: DataTypes.ENUM("active", "inactive", "deleted"),
        defaultValue: "active",
      },
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
