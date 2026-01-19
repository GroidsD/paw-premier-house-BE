import express from "express";
import voucherController from "../controllers/voucherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/api/voucher/apply",
    authMiddleware,
    roleMiddleware(["customer", "admin"]),
    voucherController.applyVoucher
);
// routes/voucher.js
router.post(
    "/api/voucher/create",
    authMiddleware,
    roleMiddleware(["admin"]),
    voucherController.createVoucher
);

export default router;
