"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Schedule extends Model {
        static associate(models) {
            // Một schedule có N nhân viên đăng ký
            Schedule.hasMany(models.ScheduleStaff, {
                foreignKey: "schedule_id",
                as: "registrations",
            });

            // Ca làm thuộc 1 shift
            Schedule.belongsTo(models.Shift, {
                foreignKey: "shift_id",
                as: "shift",
            });
            Schedule.belongsToMany(models.User, {
                through: models.ScheduleStaff, // Bảng trung gian
                foreignKey: "schedule_id",
                otherKey: "staff_id",
                as: "workingStaff", // Alias này khớp với getAllSchedules
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

            work_date: { type: DataTypes.STRING, allowNull: false },
            shift_id: { type: DataTypes.INTEGER, allowNull: false },

            status: {
                type: DataTypes.ENUM("open", "closed"),
                defaultValue: "open",
            },

            max_people: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
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
            modelName: "Schedule",
            tableName: "schedules",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Schedule;
};
