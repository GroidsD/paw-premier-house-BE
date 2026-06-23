"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class BookingItem extends Model {
        static associate(models) {
            BookingItem.belongsTo(models.Booking, {
                foreignKey: "booking_id",
                as: "booking",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            BookingItem.belongsTo(models.Service, {
                foreignKey: "service_id",
                as: "service",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    BookingItem.init(
        {
            bookingItem_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            booking_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "bookings",
                    key: "booking_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            service_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "services",
                    key: "service_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            check_in: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            check_out: {
                type: DataTypes.DATE,
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
            modelName: "BookingItem",
            tableName: "bookingItems",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return BookingItem;
};
