"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class RevenueTransaction extends Model {
        static associate(models) {
            RevenueTransaction.belongsTo(models.Order, {
                foreignKey: "order_id",
                as: "order",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            RevenueTransaction.belongsTo(models.Booking, {
                foreignKey: "booking_id",
                as: "booking",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    RevenueTransaction.init(
        {
            revenue_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            source_type: {
                type: DataTypes.ENUM("order", "booking"),
                allowNull: false,
            },

            order_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "orders",
                    key: "order_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            booking_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "bookings",
                    key: "booking_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            transaction_type: {
                type: DataTypes.ENUM("income", "refund", "adjustment"),
                allowNull: false,
                defaultValue: "income",
            },

            gross_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            net_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            status: {
                type: DataTypes.ENUM("recorded", "cancelled"),
                allowNull: false,
                defaultValue: "recorded",
            },

            transaction_date: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },

            note: {
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
            modelName: "RevenueTransaction",
            tableName: "revenue_transactions",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return RevenueTransaction;
};
