import express from "express";
import reportController from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.get(
    "/api/report/export",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin"],
    }),
    reportController.exportReport,
);

export default router;
