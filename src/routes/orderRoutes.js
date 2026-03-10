import express from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post("/api/orders/verify", orderController.verifyOrder);

// customer hoặc guest checkout
router.post("/api/orders/create", orderController.createOrder);

// admin/manager xem tất cả đơn
router.get(
    "/api/orders/get-all",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:read"],
        any: ["dashboard:admin", "dashboard:manager"],
    }),
    orderController.getAllOrders,
);

// user đã login xem chi tiết đơn
router.get(
    "/api/orders/get-by-id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:read"],
    }),
    orderController.getOrderById,
);

// user xem đơn của chính họ hoặc admin xem theo customer_id
router.get(
    "/api/orders/get-by-user",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:read"],
    }),
    orderController.getAllOrdersByUserId,
);

// admin/staff xác nhận đơn
router.post(
    "/api/orders/confirm",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.confirmOrder,
);

// admin/staff hủy đơn
router.post(
    "/api/orders/cancel",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.cancelOrder,
);

// admin/staff update status
router.patch(
    "/api/orders/update-status",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.updateStatus,
);

// manager/admin soft delete
router.delete(
    "/api/orders/soft-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:delete"],
        any: ["dashboard:admin", "dashboard:manager"],
    }),
    orderController.softDeleteOrder,
);

// admin hard delete
router.delete(
    "/api/orders/hard-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:delete"],
        any: ["dashboard:admin"],
    }),
    orderController.hardDeleteOrder,
);

export default router;