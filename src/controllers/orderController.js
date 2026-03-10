import OrderService from "../services/OrderService.js";
import { sendEmail } from "../services/EmailService.js";
import buildUrlEmail from "../utils/buildUrlEmail.js";
import { generateVerifyToken, verifyToken } from "../utils/jwt.js";

const verifyOrder = async (req, res) => {
    try {
        const { token, orderId } = req.body;

        if (!token || !orderId) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing token or orderId",
            });
        }

        const decoded = verifyToken(token);

        if (Number(decoded.orderId) !== Number(orderId)) {
            return res.status(400).json({
                errCode: 2,
                message: "Invalid token",
            });
        }

        const result = await OrderService.getOrderById(orderId);

        if (!result || result.errCode !== 0) {
            return res.status(404).json({
                errCode: result?.errCode || 3,
                message: result?.errMessage || "Order not found",
            });
        }

        return res.status(200).json({
            errCode: 0,
            message: "Order verified",
            data: result.order,
        });
    } catch (error) {
        return res.status(400).json({
            errCode: -1,
            message: "Token expired or invalid",
        });
    }
};

let createOrder = async (req, res) => {
    try {
        const result = await OrderService.createOrder(req.body);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Create order failed",
                },
            );
        }

        const { order, user } = result;

        if (order && user?.email) {
            const token = generateVerifyToken(order.order_id);
            const url = buildUrlEmail("order", order.order_id, token);

            try {
                await sendEmail({
                    to: user.email,
                    subject: "Order Confirmation",
                    html: `
                        <h2>Order Successful 🎉</h2>
                        <p>Hello <b>${user.fullname || "Customer"}</b>,</p>
                        <p>Your order has been created successfully.</p>
                        <ul>
                            <li><b>Order ID:</b> ${order.order_id}</li>
                            <li><b>Order Code:</b> ${order.order_code || ""}</li>
                            <li><b>Total:</b> ${order.total_price} VND</li>
                            <li><b>Status:</b> ${order.status}</li>
                        </ul>
                        <a href="${url}" 
                        style="
                            display:inline-block;
                            padding:12px 20px;
                            background:#4CAF50;
                            color:#fff;
                            text-decoration:none;
                            border-radius:6px;
                        ">
                            View Order
                        </a>
                        <p>Thank you for using our service.</p>
                    `,
                });
            } catch (emailError) {
                console.error("Order email send failed:", emailError);
            }
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getAllOrders = async (req, res) => {
    try {
        const result = await OrderService.getAllOrders();
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getOrderById = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.getOrderById(order_id);

        if (!result || result.errCode !== 0) {
            return res.status(404).json(
                result || {
                    errCode: -1,
                    errMessage: "Order not found",
                },
            );
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let confirmOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.confirmOrder(order_id);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Confirm order failed",
                },
            );
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let cancelOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.cancelOrder(order_id);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Cancel order failed",
                },
            );
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let updateStatus = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const { status } = req.body;

        const result = await OrderService.updateOrderStatus(order_id, status);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Update status failed",
                },
            );
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let softDeleteOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.softDeleteOrder(order_id);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Soft delete failed",
                },
            );
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let hardDeleteOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.hardDeleteOrder(order_id);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Hard delete failed",
                },
            );
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getAllOrdersByUserId = async (req, res) => {
    try {
        const customer_id = req.query.customer_id;
        const result = await OrderService.getAllOrdersByUserId(customer_id);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Fetch orders failed",
                },
            );
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

export default {
    verifyOrder,
    createOrder,
    getAllOrders,
    getOrderById,
    confirmOrder,
    cancelOrder,
    updateStatus,
    softDeleteOrder,
    hardDeleteOrder,
    getAllOrdersByUserId,
};
