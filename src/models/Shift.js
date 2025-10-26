// models/shift.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Shift extends Model {
        static associate(models) {
            Shift.hasMany(models.Schedule, { foreignKey: "shift_id" });
            Shift.hasMany(models.ShiftRequest, { foreignKey: "shift_id" });
        }
    }

    Shift.init(
        {
            shift_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: DataTypes.STRING,
            start_time: DataTypes.TIME,
            end_time: DataTypes.TIME,
            duration_hours: DataTypes.FLOAT, // VD: 8.0h
        },
        { sequelize, modelName: "Shift", tableName: "shifts" }
    );

    return Shift;
};
