import OrderService from "../services/OrderService.js";
const { sendOrderEmail } = require("../services/OrderEmailService");
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

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(400).json({
                errCode: 2,
                message: "Token expired or invalid",
            });
        }

        if (Number(decoded.type) !== Number(orderId)) {
            return res.status(400).json({
                errCode: 3,
                message: "Invalid token",
            });
        }

        const foundOrder = await OrderService.getOrderById(orderId);

        if (!foundOrder || foundOrder.errCode !== 0) {
            return res.status(404).json({
                errCode: foundOrder?.errCode || 4,
                message: foundOrder?.errMessage || "Order not found",
            });
        }

        const currentOrder = foundOrder.order;

        if (currentOrder.status === "confirmed") {
            return res.status(200).json({
                errCode: 0,
                message: "Order already confirmed",
                data: currentOrder,
            });
        }

        if (currentOrder.status !== "pending") {
            return res.status(400).json({
                errCode: 5,
                message: `Cannot verify order in status ${currentOrder.status}`,
            });
        }

        // validate payment
        if (
            currentOrder.payment_method !== "COD" &&
            currentOrder.payment_status !== "paid"
        ) {
            return res.status(400).json({
                errCode: 6,
                message: "Order has not been paid yet",
            });
        }

        const confirmResult = await OrderService.confirmOrder(orderId);

        if (!confirmResult || confirmResult.errCode !== 0) {
            return res.status(400).json({
                errCode: confirmResult?.errCode || 7,
                message: confirmResult?.errMessage || "Confirm order failed",
            });
        }

        return res.status(200).json({
            errCode: 0,
            message: "Order verified and confirmed successfully",
            data: confirmResult.order,
        });
    } catch (error) {
        console.error("verifyOrder error:", error);
        return res.status(500).json({
            errCode: -1,
            message: "Server error",
        });
    }
};

let createOrder = async (req, res) => {
    // console.log(req.body.customer_id);
    try {
        const userId = req.body.customer_id || req.user?.user_id;

        const result = await OrderService.createOrder(userId, req.body);

        if (!result || result.errCode !== 0) {
            return res.status(400).json(
                result || {
                    errCode: -1,
                    errMessage: "Create order failed",
                },
            );
        }

        const { order, user } = result;
        // console.log(user, order);

        const token = generateVerifyToken(userId, order.order_id);
        try {
            await sendOrderEmail({ user, order, token });
        } catch (emailError) {
            console.error("Order email send failed:", emailError);
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
        const { customer_id, limit, cursor, status } = req.query;
        const result = await OrderService.getAllOrdersByUserId(customer_id, limit, cursor, status);

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
