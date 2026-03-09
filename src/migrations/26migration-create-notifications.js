"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("notifications", {
            notification_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
                comment: "Khóa chính của notification",
            },

            user_id: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "User nhận notification",
                references: {
                    model: "users",
                    key: "user_id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },

            title: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Tiêu đề notification",
            },

            message: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: "Nội dung notification",
            },

            type: {
                type: Sequelize.ENUM(
                    "BOOKING_CREATED",
                    "LOW_STOCK",
                    "STAFF_REPORT",
                    "SYSTEM_ERROR",
                    "LEAVE_REQUEST",
                    "BOOKING_CANCELLED",
                    "CUSTOMER_COMPLAINT",
                    "STAFF_JOINED",
                    "BOOKING_ASSIGNED",
                    "SCHEDULE_CHANGED",
                    "LEAVE_APPROVED",
                    "WORK_REMINDER",
                ),
                allowNull: false,
                comment: "Loại notification",
            },

            entity_type: {
                type: Sequelize.ENUM(
                    "booking",
                    "product",
                    "report",
                    "staff",
                    "schedule",
                    "system",
                ),
                allowNull: true,
                comment: "Loại entity liên quan",
            },

            entity_id: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "ID của entity liên quan",
            },

            redirect_url: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "URL khi user click notification",
            },

            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: "Đánh dấu đã đọc hay chưa",
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
                ),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("notifications");

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_notifications_type";',
        );

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_notifications_entity_type";',
        );
    },
};
