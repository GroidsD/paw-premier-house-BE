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

            // Dịch vụ có thể có nhiều bản dịch (vi/en)
            Service.hasMany(models.ServiceTranslate, {
                foreignKey: "service_id",
                as: "translates",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
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
                allowNull: false,
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
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
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
