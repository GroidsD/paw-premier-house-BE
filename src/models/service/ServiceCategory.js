"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ServiceCategory extends Model {
        static associate(models) {
            // Một Category có nhiều Services
            ServiceCategory.hasMany(models.Service, {
                foreignKey: "serviceCategories_id",
                as: "services",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    ServiceCategory.init(
        {
            serviceCategories_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: "spa",
                comment: "Loại dịch vụ: spa, hotel, training, grooming, ...",
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
            modelName: "ServiceCategory",
            tableName: "serviceCategories",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return ServiceCategory;
};
