import express from "express";
import voucherController from "../controllers/voucherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();


router.post(
    "/api/voucher/apply",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["voucher:apply"],
    }),
    voucherController.applyVoucher,
);


router.post(
    "/api/voucher/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["voucher:create"],
    }),
    voucherController.createVoucher,
);

export default router;
