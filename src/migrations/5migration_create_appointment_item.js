"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Sử dụng tên bảng khớp với model: "appointmentsItems"
        await queryInterface.createTable("appointmentsItems", {
            appointmentItem_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },

            // Khóa ngoại tham chiếu đến bảng 'appointments'
            appointment_id: {
                type: Sequelize.INTEGER,
                allowNull: true, // Thêm ràng buộc NOT NULL từ model
                references: {
                    // Sử dụng tên bảng đã sửa: "appointments"
                    model: "appointments",
                    key: "appointment_id", 
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE", // Giữ nguyên CASCADE: nếu cuộc hẹn bị xóa, mục này cũng bị xóa
            },

            // Khóa ngoại tham chiếu đến bảng 'services'
            service_id: {
                type: Sequelize.INTEGER,
                allowNull: true, // Thêm ràng buộc NOT NULL từ model
                references: {
                    // Sử dụng tên bảng đã sửa: "services"
                    model: "services",
                    key: "id", 
                },
                onUpdate: "CASCADE",
                // Thay đổi thành CASCADE để nhất quán với allowNull: false, hoặc thay SET NULL bằng RESTRICT.
                // CASCADE đảm bảo mục này bị xóa nếu dịch vụ gốc bị xóa.
                onDelete: "CASCADE", 
            },
            
            // Thêm trường bị thiếu: total_price
            total_price: {
                type: Sequelize.FLOAT,
                defaultValue: 0,
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
        // Sử dụng tên bảng khớp với tên đã tạo
        await queryInterface.dropTable("appointmentsItems");
    },
};