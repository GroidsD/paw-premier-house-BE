"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    static associate(models) {
      Feedback.belongsTo(models.User, { foreignKey: "customerId", as: "customer" });
      Feedback.belongsTo(models.Appointment, { foreignKey: "appointmentId", as: "appointment" });
    }
  }

  Feedback.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      appointmentId: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      rate: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
    },
    {
      sequelize,
      modelName: "Feedback",
      tableName: "feedback",
      freezeTableName: true,
    }
  );

  return Feedback;
};
