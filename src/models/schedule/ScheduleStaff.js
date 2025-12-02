"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ScheduleStaff extends Model {
        static associate(models) {
            ScheduleStaff.belongsTo(models.Schedule, {
                foreignKey: "schedule_id",
                as: "schedule",
            });

            ScheduleStaff.belongsTo(models.User, {
                foreignKey: "staff_id",
                as: "staff",
            });

            ScheduleStaff.belongsTo(models.User, {
                foreignKey: "replaced_by",
                as: "replacedBy",
            });
        }
    }

    ScheduleStaff.init(
        {
            schedule_staff_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            schedule_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },

            staff_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            status: {
                type: DataTypes.ENUM("pending", "confirmed", "rejected"),
                defaultValue: "pending",
            },

            replaced_by: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "ScheduleStaff",
            tableName: "schedule_staff",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return ScheduleStaff;
};
