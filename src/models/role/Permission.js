"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Permission extends Model {
        static associate(models) {
            Permission.belongsToMany(models.Role, {
                through: models.RolePermission,
                foreignKey: "permission_id",
                otherKey: "role_id",
                as: "roles",
            });
            Permission.belongsToMany(models.User, {
                through: models.UserPermission,
                foreignKey: "permission_id",
                otherKey: "user_id",
                as: "users",
            });
        }
    }

    Permission.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            action: { type: DataTypes.STRING, unique: true, allowNull: false },
            description: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Permission",
            tableName: "permissions",
            timestamps: false,
        },
    );

    return Permission;
};
