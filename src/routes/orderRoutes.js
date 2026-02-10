import express from "express";
import orderController from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
    "/api/orders/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:create"],
    }),
    orderController.createOrder,
);

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

router.get(
    "/api/orders/get-by-id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:read"],
    }),
    orderController.getOrderById,
);

router.get(
    "/api/orders/get-by-user",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:read"],
    }),
    orderController.getAllOrdersByUserId,
);

router.post(
    "/api/orders/confirm",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.confirmOrder,
);

router.post(
    "/api/orders/cancel",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.cancelOrder,
);

router.patch(
    "/api/orders/update-status",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["order:update"],
    }),
    orderController.updateStatus,
);

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
