"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // Quan hệ với Order
            User.hasMany(models.Order, {
                foreignKey: "customer_id",
                as: "orders",
            });

            // Quan hệ với Feedback
            User.hasMany(models.Feedback, {
                foreignKey: "customer_id",
                as: "feedbacks",
            });

            // Quan hệ với Booking
            User.hasMany(models.Booking, {
                foreignKey: "customer_id",
                as: "bookingsAsCustomer",
            });

            User.hasMany(models.Booking, {
                foreignKey: "staff_id",
                as: "bookingsAsStaff",
            });

            // Quan hệ với Media (ảnh, video)
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
            firebase_uid: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                comment: "Firebase UID nếu user đăng nhập bằng Firebase",
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true, // có thể null nếu dùng Firebase
            },
            fullname: DataTypes.STRING,
            gender: {
                type: DataTypes.ENUM("male", "female"),
                defaultValue: "male",
            },
            avatar: DataTypes.STRING,
            address: DataTypes.STRING,
            phone: DataTypes.STRING,
            language: {
                type: DataTypes.ENUM("vi", "en"),
                defaultValue: "vi",
            },
            role: {
                type: DataTypes.ENUM("admin", "staff", "customer", "manager"),
                defaultValue: "customer",
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },

            // ✅ Thêm 2 cột mới:
            totalFeedback: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
                comment:
                    "Tổng số feedback nhận được (chỉ áp dụng cho staff trở lên)",
            },
            totalStarFeedback: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
                comment:
                    "Tổng số sao trung bình hoặc tổng số sao nhận được (chỉ áp dụng cho staff trở lên)",
            },

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
        }
    );

    // Xóa media khi xóa user
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
