"use strict";
const { Model } = require("sequelize");

function generateOrderCode() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD${yyyy}${mm}${dd}${random}`;
}

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

            order_code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
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

            receiver_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            receiver_phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            receiver_province: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            receiver_district: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            receiver_address: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            payment_method: {
                type: DataTypes.ENUM("COD", "BANK", "WALLET", "CARD"),
                allowNull: false,
                defaultValue: "COD",
            },

            payment_status: {
                type: DataTypes.ENUM(
                    "unpaid",
                    "paid",
                    "failed",
                    "expired",
                    "refunded",
                ),
                allowNull: false,
                defaultValue: "unpaid",
            },

            expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "Payment expiration time",
            },

            reserved_until: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "Time limit for pending payment orders",
            },

            voucher_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            original_price: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng giá trị gốc của đơn hàng trước giảm giá",
            },

            discount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá trị giảm giá của đơn hàng",
            },

            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "fixed",
                comment: "Loại giảm giá: percent hoặc fixed",
            },

            shipping_fee: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Phí vận chuyển",
            },

            total_price: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng thanh toán cuối cùng của đơn hàng",
            },

            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "confirmed",
                    "shipping",
                    "completed",
                    "cancelled",
                    "deleted",
                    "expired",
                ),
                allowNull: false,
                defaultValue: "pending",
                comment:
                    "Trạng thái đơn: pending, confirmed, shipping, completed, cancelled, deleted, expired",
            },

            cancel_reason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },

            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },

            // MoMo payment information fields
            momo_order_id: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "MoMo order ID from payment gateway",
            },

            momo_trans_id: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "MoMo transaction ID",
            },

            momo_result_code: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: "MoMo result code (0 = success)",
            },

            momo_message: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "MoMo response message",
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
                beforeValidate: (order) => {
                    if (!order.order_code) {
                        order.order_code = generateOrderCode();
                    }
                },

                beforeSave: (order) => {
                    let finalTotal = Number(order.original_price || 0);
                    const discount = Number(order.discount || 0);
                    const shippingFee = Number(order.shipping_fee || 0);

                    if (discount > 0) {
                        if (order.discount_type === "percent") {
                            finalTotal =
                                finalTotal - (finalTotal * discount) / 100;
                        } else if (order.discount_type === "fixed") {
                            finalTotal = finalTotal - discount;
                        }
                    }

                    finalTotal += shippingFee;
                    order.total_price =
                        finalTotal < 0 ? 0 : Number(finalTotal.toFixed(2));
                },

                afterUpdate: async (order, options) => {
                    const RevenueTransaction =
                        sequelize.models.RevenueTransaction;

                    if (!RevenueTransaction) return;

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

                    const shippingFee = Number(order.shipping_fee || 0);
                    const netAmount = Number(order.total_price || 0);

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
                                    gross_amount: grossAmount + shippingFee,
                                    discount_amount: discountAmount,
                                    net_amount: netAmount,
                                    transaction_date: new Date(),
                                    note: `Revenue from order #${order.order_code || order.order_id}`,
                                },
                                { transaction: options.transaction },
                            );
                        }
                    }

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
                                    gross_amount: grossAmount + shippingFee,
                                    discount_amount: discountAmount,
                                    net_amount: -netAmount,
                                    transaction_date: new Date(),
                                    note: `Refund for cancelled order #${order.order_code || order.order_id}`,
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
