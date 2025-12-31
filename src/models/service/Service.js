"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
        static associate(models) {
            // Mỗi Service thuộc về 1 ServiceCategory
            Service.belongsTo(models.ServiceCategory, {
                foreignKey: "serviceCategories_id",
                as: "category",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            // Mỗi Service có thể nằm trong nhiều BookingItem
            Service.hasMany(models.BookingItem, {
                foreignKey: "service_id",
                as: "bookingItems",
            });

            // Media đa hình
            Service.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false,
                scope: { entity_type: "service" },
                as: "media",
            });
        }
    }

    Service.init(
        {
            service_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            serviceCategories_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "serviceCategories",
                    key: "serviceCategories_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            /* ===== Thông tin dịch vụ ===== */
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            duration: {
                type: DataTypes.INTEGER, // phút
                allowNull: false,
                defaultValue: 60,
                comment: "Duration in minutes",
            },

            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },

            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
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
            modelName: "Service",
            tableName: "services",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return Service;
};
