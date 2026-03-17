    "use strict";
    const { Model } = require("sequelize");

    module.exports = (sequelize, DataTypes) => {
        class ServiceFeature extends Model {
            static associate(models) {
                ServiceFeature.belongsTo(models.Service, {
                    foreignKey: "service_id",
                    as: "service",
                });

                ServiceFeature.belongsTo(models.Feature, {
                    foreignKey: "feature_id",
                    as: "feature",
                });
            }
        }

        ServiceFeature.init(
            {
                id: {
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
                    comment: "Service sử dụng feature",
                },

                feature_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "features",
                        key: "feature_id",
                    },
                    comment: "Feature được gắn",
                },

                created_at: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                modelName: "ServiceFeature",
                tableName: "service_features",
                freezeTableName: true,
                timestamps: false,
            },
        );

        return ServiceFeature;
    };
