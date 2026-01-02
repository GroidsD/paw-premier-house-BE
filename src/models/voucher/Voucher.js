"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Voucher extends Model {
        static associate(models) {
            Voucher.hasMany(models.VoucherUsage, {
                foreignKey: "voucher_id",
                as: "usages",
            });
        }
    }

    Voucher.init(
        {
            voucher_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            code: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                defaultValue: "percent",
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            max_discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            min_order_value: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            usage_limit: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            used_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            apply_for: {
                type: DataTypes.ENUM("order", "booking", "all"),
                defaultValue: "all",
            },
            start_date: DataTypes.DATE,
            end_date: DataTypes.DATE,
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: "Voucher",
            tableName: "vouchers",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Voucher;
};
