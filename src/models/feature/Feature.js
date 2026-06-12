"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Feature extends Model {
        static associate(models) {
            Feature.belongsTo(models.ServiceCategory, {
                foreignKey: "serviceCategories_id",
                as: "category",
            });

            Feature.belongsToMany(models.Service, {
                through: models.ServiceFeature,
                foreignKey: "feature_id",
                otherKey: "service_id",
                as: "services",
            });
        }
    }

    Feature.init(
        {
            feature_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            feature_name_vi: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: "Tên feature tiếng Việt",
            },

            feature_name_en: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: "Tên feature tiếng Anh",
            },

            serviceCategories_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "serviceCategories",
                    key: "serviceCategories_id",
                },
                comment: "Category của feature (spa, hotel, ...)",
            },

            icon: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Icon của feature",
            },

            description_vi: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
                comment: "Mô tả feature tiếng Việt",
            },

            description_en: {
                type: DataTypes.TEXT("long"),
                allowNull: true,
                comment: "Mô tả feature tiếng Anh",
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
            modelName: "Feature",
            tableName: "features",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return Feature;
};
