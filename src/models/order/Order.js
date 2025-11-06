"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            // Mỗi Order thuộc về 1 khách hàng (User)
            Order.belongsTo(models.User, {
                foreignKey: "customer_id",
                as: "customer",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            // Một Order có thể có nhiều OrderItem (nếu bạn có bảng chi tiết đơn)
            Order.hasMany(models.OrderItem, {
                foreignKey: "order_id",
                as: "orderItems",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    Order.init(
        {
            order_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            customer_id: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: "users", // bảng users trong DB
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "confirmed",
                    "shipped",
                    "completed",
                    "cancelled"
                ),
                defaultValue: "pending",
                comment:
                    "Trạng thái đơn: pending, confirmed, shipped, completed, cancelled",
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Order",
            tableName: "orders",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Order;
};
