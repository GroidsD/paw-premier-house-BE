// src/controllers/orderController.js
import orderService from "../services/orderService.js";

let createOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errCode: -1, errMessage: "Server error" });
    }
};

let getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        return res.status(200).json(orders);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errCode: -1, errMessage: "Server error" });
    }
};

let getOrderById = async (req, res) => {
    try {
        const order_id = req.query.id;
        const order = await orderService.getOrderById(order_id);
        return res.status(200).json(order);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errCode: -1, errMessage: "Server error" });
    }
};

let updateStatus = async (req, res) => {
    try {
        const { order_id, status } = req.body;
        const result = await orderService.updateOrderStatus(order_id, status);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ errCode: -1, errMessage: "Server error" });
    }
};

export default {
    createOrder,
    getAllOrders,
    getOrderById,
    updateStatus,
};
