import express from "express";
import voucherController from "../controllers/voucherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

/* ======================================================
   APPLY VOUCHER (CUSTOMER / ADMIN)
====================================================== */
router.post(
    "/api/voucher/apply",
    authMiddleware,
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
    permissionMiddleware({
        all: ["voucher:create"],
    }),
    voucherController.createVoucher,
);

export default router;
