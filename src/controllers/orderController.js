import OrderService from "../services/OrderService.js";

// CREATE
let createOrder = async (req, res) => {
    try {
        const result = await OrderService.createOrder(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// READ ALL
let getAllOrders = async (req, res) => {
    try {
        const orders = await OrderService.getAllOrders();
        return res.status(200).json({ errCode: 0, orders });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// READ ONE
let getOrderById = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const order = await OrderService.getOrderById(order_id);
        return res.status(200).json({ errCode: 0, order });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// CONFIRM ORDER
let confirmOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        console.log(order_id, "sss");

        const result = await OrderService.confirmOrder(order_id);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// CANCEL ORDER
let cancelOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.cancelOrder(order_id);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// UPDATE STATUS (nếu cần cho các trạng thái đặc biệt)
let updateStatus = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const { status } = req.body;
        const result = await OrderService.updateOrderStatus(order_id, status);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// SOFT DELETE bằng status
let softDeleteOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.softDeleteOrder(order_id);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ errCode: -1, errMessage: "Server error" });
    }
};

// HARD DELETE
let hardDeleteOrder = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        const result = await OrderService.hardDeleteOrder(order_id);
        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ errCode: -1, errMessage: "Server error" });
    }
};
// GET ALL ORDERS BY USER ID
let getAllOrdersByUserId = async (req, res) => {
    try {
        const customer_id = req.query.customer_id;
        const result = await OrderService.getAllOrdersByUserId(customer_id);

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res
            .status(500)
            .json({ errCode: -1, errMessage: "Server error" });
    }
};

export default {
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
