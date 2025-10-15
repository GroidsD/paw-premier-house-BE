"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Example association
      // User.hasMany(models.Appointment, { foreignKey: "user_id" });
      // Quan hệ với Order
      User.hasMany(models.Order, { foreignKey: "customer_id", as: "orders" });

      // Quan hệ với Appointment (2 vai trò)
      User.hasMany(models.Appointment, { foreignKey: "customer_id", as: "appointmentsAsCustomer" });
      User.hasMany(models.Appointment, { foreignKey: "staff_id", as: "appointmentsAsStaff" });
    }
  }

  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
