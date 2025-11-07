"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ServiceTranslate extends Model {
        static associate(models) {
            // Mỗi bản dịch thuộc về một dịch vụ
            ServiceTranslate.belongsTo(models.Service, {
                foreignKey: "service_id",
                as: "service",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    ServiceTranslate.init(
        {
            serviceTranslates_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            service_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "services",
                    key: "service_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            language: {
                type: DataTypes.ENUM("vi", "en"),
                allowNull: false,
                defaultValue: "vi",
                comment: "Ngôn ngữ: vi (Vietnamese), en (English)",
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
            modelName: "ServiceTranslate",
            tableName: "serviceTranslates",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return ServiceTranslate;
};
