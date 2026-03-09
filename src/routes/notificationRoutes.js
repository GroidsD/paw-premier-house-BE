import express from "express";
import notificationController from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
    "/api/notifications/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["notification:create"],
    }),
    notificationController.createNotification,
);

router.get(
    "/api/notifications/get-all",
    authMiddleware,
    notificationController.getAllNotifications,
);

router.get(
    "/api/notifications/by-user",
    authMiddleware,
    notificationController.getNotificationsByUser,
);

router.put(
    "/api/notifications/mark-as-read",
    authMiddleware,
    notificationController.markAsRead,
);

router.put(
    "/api/notifications/mark-all-read",
    authMiddleware,
    notificationController.markAllAsRead,
);

router.delete(
    "/api/notifications/delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin"],
        all: ["notification:delete"],
    }),
    notificationController.deleteNotification,
);

export default router;
