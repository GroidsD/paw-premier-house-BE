"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Order, {
                foreignKey: "customer_id",
                as: "orders",
            });

            User.hasMany(models.Feedback, {
                foreignKey: "customer_id",
                as: "feedbacks",
            });

            User.hasMany(models.Booking, {
                foreignKey: "customer_id",
                as: "bookingsAsCustomer",
            });

            User.hasMany(models.Booking, {
                foreignKey: "staff_id",
                as: "bookingsAsStaff",
            });

            User.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false,
                scope: { entity_type: "user" },
                as: "media",
            });
            User.hasMany(models.ScheduleStaff, {
                foreignKey: "staff_id",
                as: "registrations",
            });

            User.hasMany(models.ScheduleStaff, {
                foreignKey: "replaced_by",
                as: "replacements",
            });
            User.hasMany(models.Pet, {
                foreignKey: "owner_id",
                sourceKey: "user_id",
                as: "pets",
            });
            User.belongsToMany(models.Role, {
                through: models.UserRole,
                foreignKey: "user_id",
                otherKey: "role_id",
                as: "roles",
            });

            User.hasMany(models.UserPermission, {
                foreignKey: "user_id",
                as: "permissionOverrides",
            });
        }
    }

    User.init(
        {
            user_id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },

            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            fullname: DataTypes.STRING,
            gender: {
                type: DataTypes.ENUM("male", "female", "other"),
                defaultValue: "male",
            },
            dob: DataTypes.DATEONLY,
            avatar: DataTypes.STRING,
            address: DataTypes.STRING,
            phone: DataTypes.STRING,

            auth_provider: {
                type: DataTypes.ENUM("firebase", "local"),
                defaultValue: "firebase",
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },

            totalFeedback: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment:
                    "Tổng số feedback nhận được (chỉ áp dụng cho staff trở lên)",
            },
            feedbackScore: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
                comment:
                    "Tổng số sao trung bình hoặc tổng số sao nhận được (chỉ áp dụng cho staff trở lên)",
            },
            last_login_at: { type: DataTypes.DATE },
            last_seen_at: { type: DataTypes.DATE },

            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    User.afterDestroy(async (user, options) => {
        await sequelize.models.Media.destroy({
            where: {
                entity_type: "user",
                entity_id: user.user_id,
            },
        });
    });

    return User;
};
