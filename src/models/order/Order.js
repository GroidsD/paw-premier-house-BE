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
                    let finalTotal = Number(order.original_price || 0);
                    const discount = Number(order.discount || 0);

                    if (discount > 0) {
                        if (order.discount_type === "percent") {
                            finalTotal =
                                finalTotal - (finalTotal * discount) / 100;
                        } else if (order.discount_type === "fixed") {
                            finalTotal = finalTotal - discount;
                        }
                    }

                    order.total_price = finalTotal < 0 ? 0 : finalTotal;
                },

                afterUpdate: async (order, options) => {
                    const RevenueTransaction =
                        sequelize.models.RevenueTransaction;

                    const prevStatus = order._previousDataValues.status;
                    const newStatus = order.status;

                    const grossAmount = Number(order.original_price || 0);
                    let discountAmount = 0;

                    if (Number(order.discount || 0) > 0) {
                        if (order.discount_type === "percent") {
                            discountAmount =
                                (grossAmount * Number(order.discount)) / 100;
                        } else {
                            discountAmount = Number(order.discount || 0);
                        }
                    }

                    const netAmount = Number(order.total_price || 0);

                    // Từ trạng thái khác => completed
                    if (
                        prevStatus !== "completed" &&
                        newStatus === "completed"
                    ) {
                        const existedIncome = await RevenueTransaction.findOne({
                            where: {
                                source_type: "order",
                                order_id: order.order_id,
                                transaction_type: "income",
                            },
                        });

                        if (!existedIncome) {
                            await RevenueTransaction.create(
                                {
                                    source_type: "order",
                                    order_id: order.order_id,
                                    booking_id: null,
                                    transaction_type: "income",
                                    gross_amount: grossAmount,
                                    discount_amount: discountAmount,
                                    net_amount: netAmount,
                                    transaction_date: new Date(),
                                    note: `Revenue from order #${order.order_id}`,
                                },
                                { transaction: options.transaction },
                            );
                        }
                    }

                    // Từ completed => cancelled
                    if (
                        prevStatus === "completed" &&
                        newStatus === "cancelled"
                    ) {
                        const existedRefund = await RevenueTransaction.findOne({
                            where: {
                                source_type: "order",
                                order_id: order.order_id,
                                transaction_type: "refund",
                            },
                        });

                        if (!existedRefund) {
                            await RevenueTransaction.create(
                                {
                                    source_type: "order",
                                    order_id: order.order_id,
                                    booking_id: null,
                                    transaction_type: "refund",
                                    gross_amount: grossAmount,
                                    discount_amount: discountAmount,
                                    net_amount: -netAmount,
                                    transaction_date: new Date(),
                                    note: `Refund for cancelled order #${order.order_id}`,
                                },
                                { transaction: options.transaction },
                            );
                        }
                    }
                },
            },
        },
    );

    return Order;
};
