"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Pet extends Model {
        static associate(models) {
            // Mỗi pet thuộc về 1 user
            Pet.belongsTo(models.User, {
                foreignKey: "owner_id",
                targetKey: "user_id",
                as: "owner", // alias: pet.owner
            });
            Pet.hasMany(models.Booking, {
                foreignKey: "pet_id",
                as: "bookings",
            });
            Pet.hasMany(models.Media, {
                foreignKey: "entity_id",
                constraints: false,
                scope: { entity_type: "pet" },
                as: "media",
            });
        }
    }

    Pet.init(
        {
            pet_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            owner_id: {
                type: DataTypes.STRING, // vì bên User dùng STRING (UUID hoặc Firebase UID)
                allowNull: true,
                references: {
                    model: "users", //tên bảng tham chiếu database
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            pet_image: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            weight: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            age: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            breed: {
                type: DataTypes.STRING,
                allowNull: true,
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
            modelName: "Pet",
            tableName: "pets",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );
    Pet.afterDestroy(async (pet, options) => {
        await sequelize.models.Media.destroy({
            where: {
                entity_type: "pet",
                entity_id: pet.pet_id,
            },
        });
    });

    return Pet;
};
