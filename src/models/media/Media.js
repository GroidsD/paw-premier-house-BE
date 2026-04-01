"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Media extends Model {
        static associate(models) {}
    }

    Media.init(
        {
            media_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            entity_type: {
                type: DataTypes.ENUM("product", "pet", "user", "service"),
                allowNull: false,
                comment: "Tên loại đối tượng: product, pet, user, service",
            },
            entity_id: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "ID của đối tượng tương ứng",
            },
            url: {
                type: DataTypes.TEXT,
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
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Media",
            tableName: "media",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return Media;
};
