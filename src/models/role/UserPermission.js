"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class UserPermission extends Model {
        static associate(models) {
            UserPermission.belongsTo(models.User, {
                foreignKey: "user_id",
            });

            UserPermission.belongsTo(models.Permission, {
                foreignKey: "permission_id",
            });
        }
    }

    UserPermission.init(
        {
            user_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            permission_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            allowed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "UserPermission",
            tableName: "user_permissions",
            timestamps: true, // bật timestamps
            underscored: true, // created_at, updated_at
        }
    );

    return UserPermission;
};
