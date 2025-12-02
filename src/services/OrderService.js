import { update } from "lodash";
import db from "../models";

// CREATE NEW ORDER WITH RESERVED STOCK
let createOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { customer_id, items } = data;

            if (!customer_id || !items || items.length === 0) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing customer_id or items",
                });
            }

            // Lấy thông tin sản phẩm từ DB
            const productIds = items.map((it) => it.product_id);
            const products = await db.Product.findAll({
                where: { product_id: productIds },
                include: [{ model: db.ProductTranslate, as: "translates" }],
            });

            if (!products || products.length === 0) {
                return resolve({
                    errCode: 2,
                    errMessage: "No valid products found",
                });
            }

            let original_total = 0;
            const orderItemsData = [];

            for (const item of items) {
                const product = products.find(
                    (p) => p.product_id === item.product_id
                );
                if (!product) continue;

                // Kiểm tra stock khả dụng
                const availableStock =
                    product.quantity - product.reserved_quantity;
                if (item.quantity > availableStock) {
                    return resolve({
                        errCode: 3,
                        errMessage: `Insufficient stock for product ${product.product_id}`,
                    });
                }

                const original_price = parseFloat(product.original_price);
                const discount = parseFloat(product.discount || 0);
                const discount_type = product.discount_type;

                let finalPrice = original_price;
                if (discount > 0) {
                    if (discount_type === "percent") {
                        finalPrice =
                            original_price - (original_price * discount) / 100;
                    } else if (discount_type === "fixed") {
                        finalPrice = original_price - discount;
                    }
                }
                finalPrice = finalPrice < 0 ? 0 : finalPrice;

                orderItemsData.push({
                    product_id: product.product_id,
                    quantity: item.quantity,
                    original_price,
                    discount,
                    discount_type,
                    price: finalPrice,
                });

                original_total += finalPrice * item.quantity;

                // Lock stock: tăng reserved_quantity
                await product.update({
                    reserved_quantity:
                        product.reserved_quantity + item.quantity,
                });
            }

            // Tạo Order
            const order = await db.Order.create({
                customer_id,
                original_price: original_total,
                discount: 0,
                discount_type: "percent",
                total_price: original_total,
                status: "pending",
            });

            // Tạo OrderItems
            for (const item of orderItemsData) {
                await db.OrderItem.create({
                    order_id: order.order_id,
                    ...item,
                });
            }

            // Lấy lại dữ liệu order đầy đủ
            const newOrder = await db.Order.findByPk(order.order_id, {
                include: [
                    {
                        model: db.OrderItem,
                        as: "orderItems",
                        include: [{ model: db.Product, as: "product" }],
                    },
                ],
            });

            resolve({
                errCode: 0,
                errMessage:
                    "Order created successfully (pending, stock reserved)",
                order: newOrder,
            });
        } catch (e) {
            reject(e);
        }
    });
};

// GET ALL ORDERS
let getAllOrders = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let orders = await db.Order.findAll({
                attributes: [
                    "order_id",
                    "customer_id",
                    "original_price",
                    "discount",
                    "discount_type",
                    "total_price",
                    "status",
                    "created_at",
                    "updated_at",
                ],
                include: [
                    {
                        model: db.User,
                        as: "customer",
                        attributes: ["fullname", "email", "phone", "address"],
                    },
                    {
                        model: db.OrderItem,
                        as: "orderItems",
                        attributes: [
                            "product_id",
                            "quantity",
                            "price",
                            "original_price",
                            "discount",
                            "discount_type",
                            "total_price",
                        ],
                        include: [
                            {
                                model: db.Product,
                                as: "product",
                                attributes: [
                                    "product_id",
                                    "quantity",
                                    "original_price",
                                    "price",
                                    "isActive",
                                    "isDelete",
                                ],
                                include: [
                                    {
                                        model: db.ProductTranslate,
                                        as: "translates",
                                        attributes: [
                                            "product_id",
                                            "name",
                                            "description",
                                            "language",
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                order: [["order_id", "DESC"]],
            });

            resolve(orders);
        } catch (e) {
            reject(e);
        }
    });
};

// GET ORDER BY ID
let getOrderById = (order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = await db.Order.findOne({
                where: { order_id: order_id },
                include: [
                    {
                        model: db.User,
                        as: "customer",
                        attributes: ["fullname", "email", "phone", "address"],
                    },
                    {
                        model: db.OrderItem,
                        as: "orderItems",
                        attributes: [
                            "product_id",
                            "quantity",
                            "price",
                            "created_at",
                            "updated_at",
                        ],
                        include: [
                            {
                                model: db.Product,
                                as: "product",
                                attributes: ["product_id", "quantity", "price"],
                                include: [
                                    {
                                        model: db.ProductTranslate,
                                        as: "translates",
                                        attributes: [
                                            "product_id",
                                            "name",
                                            "description",
                                            "language",
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            if (!order) {
                resolve({ errCode: 1, errMessage: "Order not found" });
            } else {
                resolve(order);
            }
        } catch (e) {
            reject(e);
        }
    });
};

// UPDATE ORDER STATUS
let updateOrderStatus = (order_id, newStatus) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await db.Order.findByPk(order_id, {
                include: [{ model: db.OrderItem, as: "orderItems" }],
            });

            if (!order) {
                return resolve({ errCode: 1, errMessage: "Order not found" });
            }

            const validStatuses = [
                "pending",
                "confirmed",
                "shipped",
                "completed",
                "cancelled",
                "deleted",
            ];

            if (!validStatuses.includes(newStatus)) {
                return resolve({
                    errCode: 2,
                    errMessage: `Invalid status: ${newStatus}`,
                });
            }

            // Chỉ cho phép cập nhật shipped nếu order đã confirmed
            if (newStatus === "shipped" && order.status !== "confirmed") {
                return resolve({
                    errCode: 3,
                    errMessage: "Order must be confirmed before shipping",
                });
            }

            // Chỉ cho phép completed nếu order đã shipped
            if (newStatus === "completed" && order.status !== "shipped") {
                return resolve({
                    errCode: 4,
                    errMessage: "Order must be shipped before completion",
                });
            }

            // Không cho update nếu đã cancelled hoặc deleted
            if (["cancelled", "deleted"].includes(order.status)) {
                return resolve({
                    errCode: 5,
                    errMessage: `Cannot update a ${order.status} order`,
                });
            }

            await order.update({ status: newStatus });

            resolve({
                errCode: 0,
                errMessage: `Order status updated to ${newStatus}`,
                order,
            });
        } catch (e) {
            reject(e);
        }
    });
};

// CONFIRM ORDER → trừ stock thực + giảm reserved_quantity
let confirmOrder = (order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await db.Order.findByPk(order_id, {
                include: [{ model: db.OrderItem, as: "orderItems" }],
            });

            if (!order) {
                return resolve({ errCode: 1, errMessage: "Order not found" });
            }

            if (order.status !== "pending") {
                return resolve({
                    errCode: 2,
                    errMessage: "Order cannot be confirmed",
                });
            }

            for (const item of order.orderItems) {
                const product = await db.Product.findByPk(item.product_id);
                if (!product) {
                    return resolve({
                        errCode: 3,
                        errMessage: `Product ${item.product_id} not found`,
                    });
                }

                // Kiểm tra stock thật
                if (product.quantity < item.quantity) {
                    return resolve({
                        errCode: 4,
                        errMessage: `Insufficient stock for product ${product.product_id}`,
                    });
                }

                await product.update({
                    quantity: product.quantity - item.quantity,
                    reserved_quantity:
                        product.reserved_quantity - item.quantity,
                });
            }

            await order.update({ status: "confirmed" });

            resolve({ errCode: 0, errMessage: "Order confirmed", order });
        } catch (e) {
            reject(e);
        }
    });
};

// CANCEL ORDER → giải phóng reserved_quantity nếu chưa confirm
let cancelOrder = (order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await db.Order.findByPk(order_id, {
                include: [{ model: db.OrderItem, as: "orderItems" }],
            });

            if (!order) {
                return resolve({ errCode: 1, errMessage: "Order not found" });
            }

            if (order.status === "cancelled") {
                return resolve({
                    errCode: 2,
                    errMessage: "Order already cancelled",
                });
            }

            for (const item of order.orderItems) {
                const product = await db.Product.findByPk(item.product_id);
                if (product) {
                    // Nếu chưa confirm → chỉ giảm reserved_quantity
                    // Nếu đã confirm → không cần giảm reserved_quantity, quantity đã trừ
                    const reservedReduction =
                        order.status === "pending" ? item.quantity : 0;
                    await product.update({
                        reserved_quantity:
                            product.reserved_quantity - reservedReduction,
                    });
                }
            }

            await order.update({ status: "cancelled" });

            resolve({ errCode: 0, errMessage: "Order cancelled", order });
        } catch (e) {
            reject(e);
        }
    });
};

// DELETE ORDER
// SOFT DELETE bằng status
let softDeleteOrder = (order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await db.Order.findByPk(order_id);
            if (!order) {
                return resolve({ errCode: 1, errMessage: "Order not found" });
            }

            if (order.status === "deleted") {
                return resolve({
                    errCode: 2,
                    errMessage: "Order already deleted",
                });
            }

            await order.update({ status: "deleted" });

            resolve({
                errCode: 0,
                errMessage: "Order marked as deleted",
                order,
            });
        } catch (e) {
            reject(e);
        }
    });
};

// HARD DELETE
let hardDeleteOrder = (order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await db.Order.findByPk(order_id);
            if (!order) {
                return resolve({ errCode: 1, errMessage: "Order not found" });
            }

            // Xóa các orderItems trước
            await db.OrderItem.destroy({ where: { order_id } });

            // Xóa order
            await order.destroy();

            resolve({ errCode: 0, errMessage: "Order hard deleted" });
        } catch (e) {
            reject(e);
        }
    });
};
// GET ALL ORDERS BY USER / CUSTOMER ID
let getAllOrdersByUserId = (customer_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!customer_id) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing customer_id",
                });
            }

            const orders = await db.Order.findAll({
                where: { customer_id },
                attributes: [
                    "order_id",
                    "customer_id",
                    "original_price",
                    "discount",
                    "discount_type",
                    "total_price",
                    "status",
                    "created_at",
                    "updated_at",
                ],
                include: [
                    {
                        model: db.OrderItem,
                        as: "orderItems",
                        include: [
                            {
                                model: db.Product,
                                as: "product",
                                include: [
                                    {
                                        model: db.ProductTranslate,
                                        as: "translates",
                                    },
                                ],
                            },
                        ],
                    },
                ],
                order: [["order_id", "DESC"]],
            });

            resolve({
                errCode: 0,
                errMessage: "Fetched orders successfully",
                orders,
            });
        } catch (e) {
            reject(e);
        }
    });
};

export default {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    confirmOrder,
    cancelOrder,
    softDeleteOrder,
    hardDeleteOrder,
    getAllOrdersByUserId,
};
