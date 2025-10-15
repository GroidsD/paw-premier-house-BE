"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: "order_id", as: "order" });
      OrderItem.belongsTo(models.Product, { foreignKey: "product_id", as: "product" });
    }
  }

  OrderItem.init(
    {
      orderItem_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      total_price: { type: DataTypes.FLOAT, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "ordersItems",
      freezeTableName: true,
    }
  );

  return OrderItem;
};
