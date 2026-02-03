import express from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ============================
// CREATE ORDER
// ============================
router.post(
    "/api/orders/create",
    authMiddleware,
    permissionMiddleware({
        all: ["order:create"],
    }),
    orderController.createOrder,
);

// ============================
// READ ALL ORDERS (ADMIN / MANAGER)
// ============================
router.get(
    "/api/orders/get-all",
    authMiddleware,
    permissionMiddleware({
        all: ["order:read"],
        any: ["dashboard:admin", "dashboard:manager"],
    }),
    orderController.getAllOrders,
);

// ============================
// READ ORDER BY ID
// ============================
router.get(
    "/api/orders/get-by-id",
    authMiddleware,
    permissionMiddleware({
        all: ["order:read"],
    }),
    orderController.getOrderById,
);

// ============================
// GET ORDERS BY USER
// ============================
router.get(
    "/api/orders/get-by-user",
    authMiddleware,
    permissionMiddleware({
        all: ["order:read"],
    }),
    orderController.getAllOrdersByUserId,
);

// ============================
// CONFIRM ORDER
// ============================
router.post(
    "/api/orders/confirm",
    authMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.confirmOrder,
);

// ============================
// CANCEL ORDER
// ============================
router.post(
    "/api/orders/cancel",
    authMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.cancelOrder,
);

// ============================
// UPDATE STATUS
// ============================
router.patch(
    "/api/orders/update-status",
    authMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.updateStatus,
);

// ============================
// SOFT DELETE
// ============================
router.delete(
    "/api/orders/soft-delete",
    authMiddleware,
    permissionMiddleware({
        all: ["order:delete"],
        any: ["dashboard:admin", "dashboard:manager"],
    }),
    orderController.softDeleteOrder,
);

// ============================
// HARD DELETE
// ============================
router.delete(
    "/api/orders/hard-delete",
    authMiddleware,
    permissionMiddleware({
        all: ["order:delete"],
        any: ["dashboard:admin"],
    }),
    orderController.hardDeleteOrder,
);

export default router;
