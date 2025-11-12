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
                    model: "orders",
                    key: "order_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            product_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "products",
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

            original_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá gốc của sản phẩm trong đơn (trước khi giảm giá)",
            },

            discount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                comment:
                    "Giá trị chiết khấu (theo phần trăm hoặc số tiền cố định)",
            },

            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "percent",
                comment: "Loại chiết khấu: percent = %, fixed = số tiền",
            },

            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá sau khi áp dụng chiết khấu",
            },

            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Tổng tiền của item (quantity * price)",
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

            hooks: {
                beforeSave: (item) => {
                    // Tính giá sau chiết khấu
                    let finalPrice = item.original_price;

                    if (item.discount && item.discount > 0) {
                        if (item.discount_type === "percent") {
                            finalPrice =
                                item.original_price -
                                (item.original_price * item.discount) / 100;
                        } else if (item.discount_type === "fixed") {
                            finalPrice = item.original_price - item.discount;
                        }
                    }

                    // Không để giá âm
                    item.price = finalPrice < 0 ? 0 : finalPrice;

                    // Tính tổng tiền = quantity * price
                    item.total_price = (item.price * item.quantity).toFixed(2);
                },
            },
        }
    );

    return OrderItem;
};
