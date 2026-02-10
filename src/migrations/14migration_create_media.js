"use strict";


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("media", {
            media_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
                comment: "Khóa chính cho bảng media",
            },
            entity_type: {
                type: Sequelize.ENUM("product", "pet", "user", "service"),
                allowNull: false,
                comment: "Tên loại đối tượng: product, pet, user, service",
            },
            entity_id: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "ID của đối tượng tương ứng (int hoặc uuid)",
            },
            url: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Đường dẫn ảnh hoặc file (VD: uploads/pet1.png)",
            },
            is_main: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                comment: "Đánh dấu ảnh chính cho đối tượng",
            },
            alt_text: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Mô tả thay thế cho SEO hoặc accessibility",
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
        await queryInterface.dropTable("media");
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_media_entity_type";',
        );
    },
};
