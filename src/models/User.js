"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            
            // Quan hệ với Order
            User.hasMany(models.Order, {
                foreignKey: "customer_id",
                as: "orders",
            });

            // Quan hệ với Appointment (2 vai trò)
            User.hasMany(models.Appointment, {
                foreignKey: "customer_id",
                as: "appointmentsAsCustomer",
            });
            User.hasMany(models.Appointment, {
                foreignKey: "staff_id",
                as: "appointmentsAsStaff",
            });
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
        
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
                validate: {
                    isEmail: true,
                },
            },

            password: {
                type: DataTypes.STRING,
                allowNull: true, // null nếu user đăng nhập qua Firebase
            },

            name: DataTypes.STRING,

            gender: {
                type: DataTypes.ENUM("male", "female"),
                defaultValue: "male",
            },

            img: DataTypes.STRING,
            address: DataTypes.STRING,
            phone: DataTypes.STRING,

            language: {
                type: DataTypes.ENUM("vi", "en"),
                defaultValue: "vi",
            },

            role: {
                type: DataTypes.ENUM("admin", "staff", "customer"),
                allowNull: false,
                defaultValue: "customer",
            },

            status: {
                type: DataTypes.ENUM("active", "inactive", "banned"),
                defaultValue: "active",
            },
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            freezeTableName: true,
        }
    );

    return User;
};
