"use strict";
const { Model } = require("sequelize");

const randomString = (length = 6) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};

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
            booking_code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            customer_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            staff_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pet_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
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
            note: {
                type: DataTypes.TEXT,
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
                beforeValidate: async (booking) => {
                    if (booking.booking_code) return;

                    let bookingCode;
                    let exists = true;
                    let retry = 0;

                    while (exists && retry < 10) {
                        const now = new Date();
                        const yyyy = now.getFullYear();
                        const mm = String(now.getMonth() + 1).padStart(2, "0");
                        const dd = String(now.getDate()).padStart(2, "0");

                        bookingCode = `BK${yyyy}${mm}${dd}${randomString(6)}`;

                        const found = await sequelize.models.Booking.findOne({
                            where: { booking_code: bookingCode },
                            attributes: ["booking_id"],
                        });

                        exists = !!found;
                        retry++;
                    }

                    if (exists) {
                        throw new Error("Không thể tạo booking code duy nhất");
                    }

                    booking.booking_code = bookingCode;
                },

                afterUpdate: async (booking, options) => {
                    const RevenueTransaction =
                        sequelize.models.RevenueTransaction;

                    const prevStatus = booking._previousDataValues.status;
                    const newStatus = booking.status;

                    const grossAmount = Number(booking.original_price || 0);
                    const discountAmount = Number(booking.discount || 0);
                    const netAmount = Number(booking.total_price || 0);

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
