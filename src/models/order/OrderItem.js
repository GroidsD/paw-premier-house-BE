"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            OrderItem.belongsTo(models.Order, {
                foreignKey: "order_id",
                as: "order",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            });

            OrderItem.belongsTo(models.Product, {
                foreignKey: "product_id",
                as: "product",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            });

            OrderItem.belongsTo(models.ProductVariant, {
                foreignKey: "productVariant_id",
                as: "variant",
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

            productVariant_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "productVariants",
                    key: "productVariant_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            product_name: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: "Tên sản phẩm tại thời điểm đặt hàng",
            },

            variant_label: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Tên biến thể tại thời điểm đặt hàng",
            },

            sku: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "SKU tại thời điểm đặt hàng",
            },

            product_image: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: "Ảnh sản phẩm tại thời điểm đặt hàng",
            },

            pet_weight: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: "Phân loại trọng lượng vật nuôi được chọn khi mua",
            },

            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },

            original_price: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá gốc của sản phẩm trong đơn (trước khi giảm giá)",
            },

            discount: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Giá trị chiết khấu của sản phẩm",
            },

            discount_type: {
                type: DataTypes.ENUM("percent", "fixed"),
                allowNull: false,
                defaultValue: "fixed",
                comment: "Loại chiết khấu: percent = %, fixed = số tiền",
            },

            price: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Đơn giá sau khi áp dụng chiết khấu",
            },

            total_price: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0,
                comment: "Thành tiền của dòng sản phẩm = price * quantity",
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
                    let finalPrice = Number(item.original_price || 0);
                    const discount = Number(item.discount || 0);
                    const quantity = Number(item.quantity || 1);

                    if (discount > 0) {
                        if (item.discount_type === "percent") {
                            finalPrice =
                                finalPrice - (finalPrice * discount) / 100;
                        } else if (item.discount_type === "fixed") {
                            finalPrice = finalPrice - discount;
                        }
                    }

                    item.price =
                        finalPrice < 0 ? 0 : Number(finalPrice.toFixed(2));
                    item.total_price = Number(
                        (item.price * quantity).toFixed(2),
                    );
                },
            },
        },
    );

    return OrderItem;
};
