"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsToMany(models.Appointment, {
        through: models.AppointmentServiceProduct,
        foreignKey: "productId",
      });
    }
  }

  Product.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      description: DataTypes.TEXT,
      status: DataTypes.ENUM("available", "out_of_stock"),
      type: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "product",
      freezeTableName: true,
    }
  );

  return Product;
};
