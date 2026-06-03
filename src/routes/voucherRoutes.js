import express from "express";
import voucherController from "../controllers/voucherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
    "/api/voucher/validate",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["voucher:apply"],
    }),
    voucherController.validateVoucher,
);

router.post(
    "/api/voucher/redeem",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["voucher:apply"],
    }),
    voucherController.redeemVoucher,
);

router.post(
    "/api/voucher/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({ any: ["dashboard:admin"], all: ["voucher:create"] }),
    voucherController.createVoucher,
);

router.get(
    "/api/voucher/list",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["voucher:read"],
    }),
    voucherController.listVouchers,
);

router.get(
    "/api/voucher/stats",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({ all: ["voucher:read"] }),
    voucherController.getVoucherStats,
);

router.put(
    "/api/voucher/:id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({ any: ["dashboard:admin"], all: ["voucher:update"] }),
    voucherController.updateVoucher,
);

router.get(
    "/api/voucher/usages/by-user",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({ all: ["voucher:read"] }),
    voucherController.getUserVoucherUsages,
);

export default router;
