"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Tag extends Model {
        static associate(models) {
            Tag.belongsToMany(models.Product, {
                through: models.ProductTag,
                foreignKey: "tag_id",
                otherKey: "product_id",
                as: "products",
            });
        }
    }

    Tag.init(
        {
            tag_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },

            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
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
            modelName: "Tag",
            tableName: "tags",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    );

    return Tag;
};
