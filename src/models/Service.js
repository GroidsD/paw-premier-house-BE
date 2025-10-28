"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
        static associate(models) {
            Service.hasMany(models.ServiceTranslate, {
                foreignKey: "services_id",
                as: "translations",
            });
            Service.hasMany(models.AppointmentItem, {
                foreignKey: "service_id",
                as: "appointmentItems",
            });
            Service.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false, // Không tạo FK constraint thật
                scope: {
                    entity_type: "service", // Chỉ lấy media của loại "service"
                },
                as: "media_service",
            });
            Service.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false, // Không tạo FK constraint thật
                scope: {
                    entity_type: "hotel", // Chỉ lấy media của loại "hotel"
                },
                as: "media_hotel",
            });
        }
    }

    Service.init(
        {
            services_id: {
                type: DataTypes.INTEGER,
                unique: true,
                autoIncrement: true,
                primaryKey: true,
            },
            status: {
                type: DataTypes.ENUM("active", "inactive", "deleted"),
                defaultValue: "active",
            },
        },
        {
            sequelize,
            modelName: "Service",
            tableName: "services",
            freezeTableName: true,
        }
    );

    return Service;
};
