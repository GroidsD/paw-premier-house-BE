import db from "../models";

// CREATE NEW ORDER
let createOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { customer_id, items } = data;
            console.log(data);
            
            if (!customer_id || !items || items.length === 0) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing customer_id or items",
                });
            }

            // Lấy thông tin sản phẩm
            const productIds = items.map((it) => it.product_id);
            const products = await db.Product.findAll({
                where: { product_id: productIds },
                include: [{ model: db.ProductTranslate, as: "translations" }],
            });

            // Tính tổng tiền và chuẩn bị danh sách items
            let total_price = 0;
            const orderItems = [];

            for (const item of items) {
                const product = products.find(
                    (p) => p.product_id === item.product_id
                );
                if (!product) continue;

                const price = product.translations[0]?.price || 0;
                const lineTotal = price * item.quantity;
                console.log(`Product ID: ${item.product_id}, Quantity: ${item.quantity}, Line Total: ${lineTotal}, Price: ${price}`);
                
                orderItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    total_price: lineTotal,
                });

                total_price += lineTotal;
            }

            // Tạo đơn hàng
            const order = await db.Order.create({
                
                customer_id,
                total_price,
                status: "pending",
            });

            // Thêm chi tiết đơn hàng
            for (const index of orderItems) {
                await db.OrderItem.create({
                    ...index,
                    order_id: order.order_id,
                });
            }

            resolve({
                errCode: 0,
                errMessage: "Order created successfully",
                order_id: order.order_id,
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
                include: [
                    {
                        model: db.User,
                        as: "customer",
                        attributes: ["user_id", "name", "email"],
                    },
                    {
                        model: db.OrderItem,
                        as: "items",
                        include: [
                            {
                                model: db.Product,
                                as: "product",
                                include: [
                                    {
                                        model: db.ProductTranslate,
                                        as: "translations",
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
                        attributes: ["user_id", "name", "email"],
                    },
                    {
                        model: db.OrderItem,
                        as: "items",
                        include: [
                            {
                                model: db.Product,
                                as: "product",
                                include: [
                                    {
                                        model: db.ProductTranslate,
                                        as: "translations",
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
let updateOrderStatus = (order_id, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = await db.Order.findByPk(order_id);
            if (!order) {
                return resolve({ errCode: 1, errMessage: "Order not found" });
            }

            await order.update({ status });

            resolve({ errCode: 0, errMessage: "Status updated", order });
        } catch (e) {
            reject(e);
        }
    });
};

// DELETE ORDER
let deleteOrder = (order_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await db.Order.findByPk(order_id);

            if (!order) {
                return resolve({ errCode: 1, errMessage: "Order not found" });
            }

            // await db.OrderItem.destroy({ where: { order_id: order_id } });
            // await order.destroy();

            resolve({ errCode: 0, errMessage: "Order deleted successfully" });
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
    deleteOrder,
};
