import express from "express";
import voucherController from "../controllers/voucherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

/* ======================================================
   APPLY VOUCHER (CUSTOMER / ADMIN)
====================================================== */
router.post(
    "/api/voucher/apply",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["voucher:apply"],
    }),
    voucherController.applyVoucher,
);

/* ======================================================
   CREATE VOUCHER (ADMIN)
====================================================== */
router.post(
    "/api/voucher/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({ any: ["dashboard:admin"], all: ["voucher:create"] }),
    voucherController.createVoucher,
);
// LIST VOUCHERS (ADMIN)
router.get(
    "/api/voucher/list",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["voucher:read"],
    }),
    voucherController.listVouchers,
);

// STATS (ADMIN)
router.get(
    "/api/voucher/stats",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({ all: ["voucher:read"] }),
    voucherController.getVoucherStats,
);

export default router;
