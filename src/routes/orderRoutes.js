import express from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE - Tạo đơn hàng mới
router.post("/api/orders/create", authMiddleware, orderController.createOrder);

// READ ALL - Lấy tất cả đơn hàng
router.get("/api/orders/get-all", authMiddleware, orderController.getAllOrders);

// READ ONE - Lấy đơn hàng theo ID
router.get(
    "/api/orders/get-by-id",
    authMiddleware,
    orderController.getOrderById
);

// CONFIRM ORDER - Xác nhận đơn hàng
router.post(
    "/api/orders/confirm",
    authMiddleware,
    orderController.confirmOrder
);

// CANCEL ORDER - Hủy đơn hàng
router.post("/api/orders/cancel", authMiddleware, orderController.cancelOrder);

// UPDATE STATUS - Cập nhật trạng thái khác nếu cần
router.patch(
    "/api/orders/update-status",
    authMiddleware,
    orderController.updateStatus
);

//  DELETE - Xóa đơn hàng
router.delete(
    "/api/orders/delete",
    authMiddleware,
    orderController.deleteOrder
);

// SOFT DELETE
router.patch(
    "/api/orders/soft-delete",
    authMiddleware,
    orderController.softDeleteOrder
);

// HARD DELETE
router.delete(
    "/api/orders/hard-delete",
    authMiddleware,
    orderController.hardDeleteOrder
);
export default router;
