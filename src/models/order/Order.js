"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.belongsTo(models.User, {
                foreignKey: "customer_id",
                targetKey: "user_id",
                as: "customer",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

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
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            original_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng giá trị gốc của đơn hàng (trước khi giảm giá)",
            },

            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment:
                    "Giá trị chiết khấu (theo phần trăm hoặc số tiền cố định)",
            },

            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
                comment: "Loại chiết khấu: percent = %, fixed = số tiền",
            },

            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng giá trị đơn hàng sau khi áp dụng giảm giá",
            },

            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "confirmed",
                    "shipped",
                    "completed",
                    "cancelled",
                    "deleted",
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
            hooks: {
                beforeSave: (order) => {
                    let finalTotal = order.original_price;

                    if (order.discount && order.discount > 0) {
                        if (order.discount_type === "percent") {
                            finalTotal =
                                order.original_price -
                                (order.original_price * order.discount) / 100;
                        } else if (order.discount_type === "fixed") {
                            finalTotal = order.original_price - order.discount;
                        }
                    }

                    order.total_price = finalTotal < 0 ? 0 : finalTotal;
                },
            },
        },
    );

    return Order;
};
