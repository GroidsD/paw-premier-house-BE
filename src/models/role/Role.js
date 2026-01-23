"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.belongsToMany(models.User, {
                through: models.UserRole,
                foreignKey: "role_id",
                otherKey: "user_id",
                as: "users",
            });

            Role.belongsToMany(models.Permission, {
                through: models.RolePermission,
                foreignKey: "role_id",
                otherKey: "permission_id",
                as: "permissions",
            });
        }
    }

    Role.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Role",
            tableName: "roles",
            timestamps: false,
        },
    );

    return Role;
};
