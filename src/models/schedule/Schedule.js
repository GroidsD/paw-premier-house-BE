// models/schedule.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Schedule extends Model {
        static associate(models) {
            Schedule.belongsTo(models.User, {
                foreignKey: "staff_id",
                as: "staff",
            });
            Schedule.belongsTo(models.Shift, { foreignKey: "shift_id" });

            Schedule.belongsTo(models.User, {
                foreignKey: "replaced_by",
                as: "replacement",
            });
        }
    }

    Schedule.init(
        {
            schedule_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            staff_id: { type: DataTypes.STRING, allowNull: false },
            work_date: { type: DataTypes.STRING, allowNull: false },
            shift_id: { type: DataTypes.INTEGER, allowNull: false },
            status: {
                type: DataTypes.ENUM(
                    "confirmed",
                    "pending",
                    "cancelled",
                    "replaced"
                ),
                defaultValue: "pending",
            },
            work_status: {
                type: DataTypes.ENUM(
                    "not_started",
                    "in_progress",
                    "completed",
                    "absent"
                ),
                defaultValue: "not_started",
            },

            work_note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            replaced_by: { type: DataTypes.STRING, allowNull: true },
        },
        { sequelize, modelName: "Schedule", tableName: "schedules" }
    );

    return Schedule;
};
