"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            // 1 khách hàng có nhiều đơn hàng
            Order.belongsTo(models.User, {
                foreignKey: "customer_id",
                as: "customer",
            });

            // 1 đơn hàng có nhiều sản phẩm
            Order.hasMany(models.OrderItem, {
                foreignKey: "order_id",
                as: "items",
            });
        }
    }

    Order.init(
        {
            order_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
            },
            customer_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            total_price: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
            },

            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "paid",
                    "cancelled",
                    "shipped",
                    "completed"
                ),
                defaultValue: "pending",
            },
        },
        {
            sequelize,
            modelName: "Order",
            tableName: "orders",
            freezeTableName: true,
        }
    );

    return Order;
};
