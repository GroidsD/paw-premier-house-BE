// // src/routes/orderRoutes.js
// import express from "express";
// import orderController from "../controllers/orderController.js";
// import authMiddleware from "../middleware/authMiddleware";
// import adminMiddleware from "../middleware/adminMiddleware";
// import roleMiddleware from "../middleware/roleMiddleware";

// let router = express.Router();

// //  CREATE - Tạo đơn hàng mới
// router.post(
//   "/api/create-new-order",
//   // authMiddleware,
//   orderController.createOrder
// );

// //  READ ALL - Lấy tất cả đơn hàng
// router.get("/api/get-all-orders",
//   // authMiddleware,
//   orderController.getAllOrders);

// //  READ ONE - Lấy đơn hàng theo ID
// router.get(
//   "/api/get-order-by-id",
//   authMiddleware,
//   orderController.getOrderById
// );

// //  UPDATE - Cập nhật trạng thái đơn hàng hoặc chi tiết
// router.post("/api/update-order", authMiddleware, orderController.updateStatus);

// // //  DELETE - Xóa đơn hàng
// // router.get("/api/delete-order", orderController.handleDeleteOrder);

// export default router;
