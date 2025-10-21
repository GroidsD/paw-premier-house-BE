// src/routes/orderRoutes.js
import express from "express";
import orderController from "../controllers/orderController.js";

let router = express.Router();

//  CREATE - Tạo đơn hàng mới
router.post("/api/create-new-order", orderController.createOrder);

//  READ ALL - Lấy tất cả đơn hàng
router.get("/api/get-all-orders", orderController.getAllOrders);

//  READ ONE - Lấy đơn hàng theo ID
router.get("/api/get-order-by-id", orderController.getOrderById);

//  UPDATE - Cập nhật trạng thái đơn hàng hoặc chi tiết
router.post("/api/update-order", orderController.updateStatus);

// //  DELETE - Xóa đơn hàng
// router.get("/api/delete-order", orderController.handleDeleteOrder);

export default router;
