"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pet extends Model {
    static associate(models) {
      Pet.belongsTo(models.User, { foreignKey: "customerId", as: "owner" });
      Pet.hasMany(models.Appointment, { foreignKey: "petId", as: "appointments" });
    }
  }

  Pet.init(
    {
      petId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      breed: DataTypes.STRING,
      species: DataTypes.STRING,
      gender: DataTypes.ENUM("male", "female"),
      birthDate: DataTypes.DATEONLY,
      note: DataTypes.TEXT,
      customerId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Pet",
      tableName: "pets",
      freezeTableName: true,
    }
  );

  return Pet;
};
