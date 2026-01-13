"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class UserRole extends Model {
        static associate(models) {
            UserRole.belongsTo(models.User, {
                foreignKey: "user_id",
            });

            UserRole.belongsTo(models.Role, {
                foreignKey: "role_id",
            });
        }
    }

    UserRole.init(
        {
            user_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            role_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelName: "UserRole",
            tableName: "user_roles",
            timestamps: true, // bật timestamps
            underscored: true, // created_at, updated_at
        }
    );

    return UserRole;
};
