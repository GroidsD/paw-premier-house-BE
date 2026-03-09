"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user",
            });
        }
    }

    Notification.init(
        {
            notification_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
                comment: "User nhận notification",
            },

            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            type: {
                type: DataTypes.ENUM(
                    "BOOKING_CREATED",
                    "LOW_STOCK",
                    "STAFF_REPORT",
                    "SYSTEM_ERROR",
                    "LEAVE_REQUEST",
                    "BOOKING_CANCELLED",
                    "CUSTOMER_COMPLAINT",
                    "STAFF_JOINED",
                    "BOOKING_ASSIGNED",
                    "SCHEDULE_CHANGED",
                    "LEAVE_APPROVED",
                    "WORK_REMINDER",
                ),
                allowNull: false,
                comment: "Loại notification",
            },

            entity_type: {
                type: DataTypes.ENUM(
                    "booking",
                    "product",
                    "report",
                    "staff",
                    "schedule",
                    "system",
                ),
                allowNull: true,
                comment: "Loại entity liên quan",
            },

            entity_id: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "ID của entity liên quan",
            },

            redirect_url: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "URL redirect khi click notification",
            },

            is_read: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
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
            modelName: "Notification",
            tableName: "notifications",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return Notification;
};
