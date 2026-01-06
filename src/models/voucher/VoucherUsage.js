"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class VoucherUsage extends Model {
        static associate(models) {
            VoucherUsage.belongsTo(models.Voucher, {
                foreignKey: "voucher_id",
                as: "voucher",
            });

            VoucherUsage.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user",
            });

            VoucherUsage.belongsTo(models.Booking, {
                foreignKey: "booking_id",
                as: "booking",
            });

            VoucherUsage.belongsTo(models.Order, {
                foreignKey: "order_id",
                as: "order",
            });
        }
    }

    VoucherUsage.init(
        {
            voucher_usage_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            voucher_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            booking_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            order_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },

            status: {
                type: DataTypes.ENUM("used", "refunded"),
                defaultValue: "used",
            },

            used_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },

            refunded_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "VoucherUsage",
            tableName: "voucher_usages",
            timestamps: false,

            indexes: [
                {
                    unique: true,
                    fields: ["voucher_id", "user_id"],
                },
            ],
        }
    );
    return VoucherUsage;
};
