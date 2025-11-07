"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true,
            },
            firebase_uid: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
                comment: "Firebase UID nếu user đăng nhập bằng Firebase",
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            fullname: {
                type: Sequelize.STRING,
            },
            gender: {
                type: Sequelize.ENUM("male", "female"),
                defaultValue: "male",
            },
            avatar: {
                type: Sequelize.STRING,
            },
            address: {
                type: Sequelize.STRING,
            },
            phone: {
                type: Sequelize.STRING,
            },
            language: {
                type: Sequelize.ENUM("vi", "en"),
                defaultValue: "vi",
            },
            role: {
                type: Sequelize.ENUM("admin", "staff", "customer"),
                allowNull: false,
                defaultValue: "customer",
            },
            isDeleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },

            // ✅ Hai cột mới thêm
            totalFeedback: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
                comment:
                    "Tổng số feedback nhận được (chỉ áp dụng cho staff trở lên)",
            },
            totalStarFeedback: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
                allowNull: false,
                comment:
                    "Tổng số sao trung bình hoặc tổng số sao nhận được (chỉ áp dụng cho staff trở lên)",
            },

            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("users");
    },
};
