import express from "express";
import shiftRequestController from "../controllers/shiftRequestController";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";

let router = express.Router();

// STAFF đăng ký ca làm
router.post(
    "/api/create-shift-request",
    authMiddleware,
    shiftRequestController.create
);

// ADMIN xem tất cả request đang chờ duyệt
router.get(
    "/api/get-pending-shift-requests",
    authMiddleware,
    // adminMiddleware,
    shiftRequestController.getPending
);

// ADMIN duyệt ca
router.put(
    "/api/approve-shift-request",
    authMiddleware,
    adminMiddleware,
    shiftRequestController.approve
);

// ADMIN từ chối ca
router.put(
    "/api/reject-shift-request",
    authMiddleware,
    adminMiddleware,
    shiftRequestController.reject
);

export default router;
