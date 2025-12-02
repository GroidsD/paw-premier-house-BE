import express from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

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
// GET ALL ORDERS BY USER ID
router.get(
    "/api/orders/get-by-user",
    authMiddleware,
    orderController.getAllOrdersByUserId
);
// CONFIRM ORDER - Xác nhận đơn hàng
router.post(
    "/api/orders/confirm",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    orderController.confirmOrder
);

// CANCEL ORDER - Hủy đơn hàng
router.post(
    "/api/orders/cancel",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    orderController.cancelOrder
);

// UPDATE STATUS - Cập nhật trạng thái khác nếu cần
router.patch(
    "/api/orders/update-status",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    orderController.updateStatus
);

// SOFT DELETE
router.delete(
    "/api/orders/soft-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    orderController.softDeleteOrder
);

// HARD DELETE
router.delete(
    "/api/orders/hard-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    orderController.hardDeleteOrder
);
export default router;
