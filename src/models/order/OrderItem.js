"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            // Mỗi OrderItem thuộc về một Order
            OrderItem.belongsTo(models.Order, {
                foreignKey: "order_id",
                as: "order",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            // Mỗi OrderItem thuộc về một Product
            OrderItem.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });
        }
    }

    OrderItem.init(
        {
            orderItem_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            order_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "orders", // bảng orders trong DB
                    key: "order_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "products", // bảng products trong DB
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
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
            modelName: "OrderItem",
            tableName: "orderItems",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return OrderItem;
};
