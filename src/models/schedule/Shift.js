// models/shift.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Shift extends Model {
        static associate(models) {
            Shift.hasMany(models.Schedule, { foreignKey: "shift_id" });
        }
    }

    Shift.init(
        {
            shift_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            shift_name: DataTypes.STRING,
            start_time: DataTypes.TIME,
            end_time: DataTypes.TIME,
            duration_hours: DataTypes.FLOAT, // VD: 8.0h
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
            modelName: "Shift",
            tableName: "shifts",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Shift;
};
