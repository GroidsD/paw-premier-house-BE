"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Booking extends Model {
        static associate(models) {
            // Booking thuộc về khách hàng
            Booking.belongsTo(models.User, {
                foreignKey: "customer_id",
                targetKey: "user_id",
                as: "customer",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            // Booking thuộc về nhân viên
            Booking.belongsTo(models.User, {
                foreignKey: "staff_id",
                targetKey: "user_id",
                as: "staff",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            // Booking thuộc về 1 pet
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
                type: DataTypes.ENUM("pending", "approved", "rejected"),
                defaultValue: "pending",
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
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
        }
    );

    return Booking;
};
