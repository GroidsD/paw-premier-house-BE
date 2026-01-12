"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class RolePermission extends Model {
        static associate(models) {
            RolePermission.belongsTo(models.Role, {
                foreignKey: "role_id",
            });

            RolePermission.belongsTo(models.Permission, {
                foreignKey: "permission_id",
            });
        }
    }

    RolePermission.init(
        {
            role_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            permission_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
        },
        {
            sequelize,
            modelName: "RolePermission",
            tableName: "role_permissions",
            timestamps: false,
        }
    );

    return RolePermission;
};
