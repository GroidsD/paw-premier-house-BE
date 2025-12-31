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

            VoucherUsage.belongsTo(models.Order, {
                foreignKey: "order_id",
                as: "order",
            });

            VoucherUsage.belongsTo(models.Booking, {
                foreignKey: "booking_id",
                as: "booking",
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
            voucher_id: DataTypes.INTEGER,
            user_id: DataTypes.STRING,
            order_id: DataTypes.INTEGER,
            booking_id: DataTypes.INTEGER,
            used_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "VoucherUsage",
            tableName: "voucherUsages",
            timestamps: false,
        }
    );

    return VoucherUsage;
};
