"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Media extends Model {
        static associate(models) {
            // Không cần liên kết cụ thể, vì sẽ dùng entity_type + entity_id
        }
    }

    Media.init(
        {
            media_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            entity_type: {
                type: DataTypes.STRING,
                allowNull: false,
                comment:
                    "Tên bảng hoặc loại đối tượng: product, user, spaService...",
            },
            entity_id: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "ID của đối tượng tương ứng",
            },
            url: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Đường dẫn ảnh hoặc file",
            },
            is_main: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                comment: "Đánh dấu ảnh chính",
            },
            alt_text: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Mô tả thay thế cho SEO hoặc accessibility",
            },
        },
        {
            sequelize,
            modelName: "Media",
            tableName: "media",
            freezeTableName: true,
        }
    );

    return Media;
};
