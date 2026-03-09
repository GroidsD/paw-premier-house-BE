import express from "express";
import revenueController from "../controllers/revenueController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
    "/api/revenue/dashboard",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["revenue:read"],
    }),
    revenueController.getRevenueDashboard,
);

router.get(
    "/api/revenue/summary",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["revenue:read"],
    }),
    revenueController.getRevenueSummary,
);

router.get(
    "/api/revenue/by-period",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["revenue:read"],
    }),
    revenueController.getRevenueByPeriod,
);

router.get(
    "/api/revenue/by-source",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["revenue:read"],
    }),
    revenueController.getRevenueBySource,
);

router.get(
    "/api/revenue/recent",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["revenue:read"],
    }),
    revenueController.getRecentTransactions,
);

export default router;
