"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("media", {
            media_id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            entity_type: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Tên bảng hoặc loại đối tượng: product, spaService...",
            },
            entity_id: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "ID của đối tượng tương ứng",
            },
            url: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Đường dẫn ảnh hoặc file",
            },
            is_main: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                comment: "Đánh dấu ảnh chính",
            },
            alt_text: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Mô tả thay thế cho SEO hoặc accessibility",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });

        // Tạo chỉ mục để truy vấn nhanh theo entity
        await queryInterface.addIndex("media", ["entity_type", "entity_id"], {
            name: "idx_media_entity",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("media");
    },
};
