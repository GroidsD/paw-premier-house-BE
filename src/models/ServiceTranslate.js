"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ServiceTranslate extends Model {
        static associate(models) {
            ServiceTranslate.belongsTo(models.Service, {
                foreignKey: "services_id",
                as: "service",
            });
        }
    }

    ServiceTranslate.init(
        {
            serviceTranslate_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            services_id: { type: DataTypes.INTEGER, allowNull: false },
            name: DataTypes.STRING,
            description: DataTypes.TEXT,
            price: DataTypes.FLOAT,
            lang: {
                type: DataTypes.ENUM("vi", "en"),
                defaultValue: "vi",
            },
        },
        {
            sequelize,
            modelName: "ServiceTranslate",
            tableName: "serviceTranslates",
            freezeTableName: true,
        }
    );

    return ServiceTranslate;
};
