"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Pet extends Model {
        static associate(models) {
            // Pet thuộc về User
            Pet.belongsTo(models.User, {
                foreignKey: "owner_id",
                targetKey: "user_id",
                as: "owner",
            });

            // Pet có nhiều Booking
            Pet.hasMany(models.Booking, {
                foreignKey: "pet_id",
                as: "bookings",
            });

            // Media đa hình
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
            },

            owner_id: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            /* ===== Thông tin pet ===== */
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

            status: {
                type: DataTypes.ENUM("active", "inactive", "draft"),
                defaultValue: "active",
            },

            /* ===== Thông tin vật lý ===== */
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

    // Xóa media khi xóa pet
    Pet.afterDestroy(async (pet) => {
        await sequelize.models.Media.destroy({
            where: {
                entity_type: "pet",
                entity_id: pet.pet_id,
            },
        });
    });

    return Pet;
};
