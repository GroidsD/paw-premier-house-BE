// models/shiftrequest.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ShiftRequest extends Model {
        static associate(models) {
            ShiftRequest.belongsTo(models.User, {
                foreignKey: "staff_id",
                as: "staff",
            });
            ShiftRequest.belongsTo(models.Shift, { foreignKey: "shift_id" });
            ShiftRequest.belongsTo(models.WorkDate, {
                foreignKey: "work_date_id",
            });
        }
    }

    ShiftRequest.init(
        {
            shift_request_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            staff_id: { type: DataTypes.STRING, allowNull: false },
            work_date_id: { type: DataTypes.INTEGER, allowNull: false },

            shift_id: { type: DataTypes.INTEGER, allowNull: false },
            status: {
                type: DataTypes.ENUM("pending", "approved", "rejected"),
                defaultValue: "pending",
            },
        },
        { sequelize, modelName: "ShiftRequest", tableName: "shift_requests" }
    );

    return ShiftRequest;
};
