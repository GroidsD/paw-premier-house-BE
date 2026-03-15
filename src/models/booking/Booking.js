"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        static associate(models) {
            Booking.belongsTo(models.User, {
                foreignKey: "customer_id",
                targetKey: "user_id",
                as: "customer",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            Booking.belongsTo(models.User, {
                foreignKey: "staff_id",
                targetKey: "user_id",
                as: "staff",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            Booking.belongsTo(models.Pet, {
                foreignKey: "pet_id",
                as: "pet",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            Booking.hasMany(models.BookingItem, {
                foreignKey: "booking_id",
                as: "bookingItems",
            });

            Booking.belongsTo(models.Voucher, {
                foreignKey: "voucher_id",
                as: "voucher",
            });
        }
    }

    Booking.init(
        {
            booking_id: {
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
            staff_id: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            pet_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "pets",
                    key: "pet_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            original_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            voucher_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "vouchers",
                    key: "voucher_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "assigned",
                    "cancelled",
                    "completed",
                ),
                defaultValue: "pending",
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            check_in: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            check_out: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            cancelled_by: {
                type: DataTypes.ENUM("customer", "staff", "system"),
                allowNull: true,
            },
            cancel_reason: {
                type: DataTypes.STRING,
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
        },
        {
            sequelize,
            modelName: "Booking",
            tableName: "bookings",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            hooks: {
                afterUpdate: async (booking, options) => {
                    const RevenueTransaction =
                        sequelize.models.RevenueTransaction;

                    const prevStatus = booking._previousDataValues.status;
                    const newStatus = booking.status;

                    const grossAmount = Number(booking.original_price || 0);
                    const discountAmount = Number(booking.discount || 0);
                    const netAmount = Number(booking.total_price || 0);

                    // Từ trạng thái khác => completed
                    if (
                        prevStatus !== "completed" &&
                        newStatus === "completed"
                    ) {
                        const existedIncome = await RevenueTransaction.findOne({
                            where: {
                                source_type: "booking",
                                booking_id: booking.booking_id,
                                transaction_type: "income",
                            },
                        });

                        if (!existedIncome) {
                            await RevenueTransaction.create(
                                {
                                    source_type: "booking",
                                    order_id: null,
                                    booking_id: booking.booking_id,
                                    transaction_type: "income",
                                    gross_amount: grossAmount,
                                    discount_amount: discountAmount,
                                    net_amount: netAmount,
                                    transaction_date: new Date(),
                                    note: `Revenue from booking #${booking.booking_id}`,
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
                                source_type: "booking",
                                booking_id: booking.booking_id,
                                transaction_type: "refund",
                            },
                        });

                        if (!existedRefund) {
                            await RevenueTransaction.create(
                                {
                                    source_type: "booking",
                                    order_id: null,
                                    booking_id: booking.booking_id,
                                    transaction_type: "refund",
                                    gross_amount: grossAmount,
                                    discount_amount: discountAmount,
                                    net_amount: -netAmount,
                                    transaction_date: new Date(),
                                    note: `Refund for cancelled booking #${booking.booking_id}`,
                                },
                                { transaction: options.transaction },
                            );
                        }
                    }
                },
            },
        },
    );

    return Booking;
};
