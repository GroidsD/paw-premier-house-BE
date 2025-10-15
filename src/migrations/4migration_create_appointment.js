"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Tên bảng phải khớp với tableName trong model, tức là 'appointments'
        await queryInterface.createTable("appointments", {
            // id: {
            //     allowNull: false,
            //     autoIncrement: true,
            //     primaryKey: true,
            //     type: Sequelize.INTEGER,
            // },
            
            // Sửa lỗi: appointment_id là STRING và UNIQUE, không phải Khóa ngoại
            appointment_id: {
                type: Sequelize.INTEGER,
               autoIncrement: true,
                primaryKey: true,
                unique: true, // Thêm ràng buộc UNIQUE
            },

            customer_id: {
                type: Sequelize.INTEGER,
                allowNull: true, // Bắt buộc phải có theo model
                references: {
                    // Tên bảng tham chiếu
                    model: "users",
                    key: "user_id", // Tên khóa chính trong bảng users
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL", // Giữ nguyên hành vi onDelete đã có
            },

            staff_id: {
                type: Sequelize.INTEGER,
                allowNull: true, // Cho phép NULL theo model
                references: {
                    // Tên bảng tham chiếu
                    model: "users",
                    key: "user_id", // Tên khóa chính trong bảng users
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL", // Giữ nguyên hành vi onDelete đã có
            },
            
            // Thêm các trường bị thiếu: total_price
            total_price: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
            },

            // Thêm các trường bị thiếu: status
            status: {
                type: Sequelize.ENUM("pending", "confirmed", "completed", "cancelled"),
                defaultValue: "pending",
            },

            // Thêm các trường bị thiếu: date
            date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        // Tên bảng phải khớp với tên đã tạo
        await queryInterface.dropTable("appointments");
    },
};