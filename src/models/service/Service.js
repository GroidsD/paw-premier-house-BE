"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Service extends Model {
        static associate(models) {
            Service.belongsTo(models.ServiceCategory, {
                foreignKey: "serviceCategories_id",
                as: "category",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            Service.hasMany(models.BookingItem, {
                foreignKey: "service_id",
                as: "bookingItems",
            });

            Service.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false,
                scope: { entity_type: "service" },
                as: "media",
            });
            Service.belongsToMany(models.Feature, {
                through: models.ServiceFeature,
                foreignKey: "service_id",
                otherKey: "feature_id",
                as: "features",
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
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1440,
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
        },
    );

    return Service;
};
