// models/workdate.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class WorkDate extends Model {
        static associate(models) {
            WorkDate.hasMany(models.Schedule, { foreignKey: "work_date_id" });
            WorkDate.hasMany(models.ShiftRequest, {
                foreignKey: "work_date_id",
            });
        }
    }

    WorkDate.init(
        {
            work_date_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            work_date: { type: DataTypes.DATEONLY, allowNull: false },
        },
        { sequelize, modelName: "WorkDate", tableName: "workdates" }
    );

    return WorkDate;
};
