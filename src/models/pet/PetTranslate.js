"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class PetsTranslate extends Model {
        static associate(models) {
            // Mỗi bản dịch thuộc về 1 thú cưng
            PetsTranslate.belongsTo(models.Pet, {
                foreignKey: "pet_id",
                as: "pet",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });
        }
    }

    PetsTranslate.init(
        {
            petTranslate_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            pet_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "pets", // tên bảng trong DB
                    key: "pet_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            species: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            gender: {
                type: DataTypes.ENUM("male", "female", "unknown"),
                defaultValue: "unknown",
            },
            language: {
                type: DataTypes.ENUM("vi", "en"),
                allowNull: false,
                defaultValue: "vi",
            },
            status: {
                type: DataTypes.ENUM("active", "inactive", "draft"),
                defaultValue: "active",
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
            modelName: "PetsTranslate",
            tableName: "petsTranslates",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return PetsTranslate;
};
