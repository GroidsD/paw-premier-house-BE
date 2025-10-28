import express from "express";
import scheduleController from "../controllers/scheduleController";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
let router = express.Router();

// STAFF xem lịch làm của mình
router.get(
    "/api/get-my-schedule",
    authMiddleware,
    scheduleController.getMySchedule
);

// ADMIN xem tất cả lịch làm (có filter)
router.get(
    "/api/get-all-schedules",
    authMiddleware,
    adminMiddleware,
    scheduleController.getAll
);

// ADMIN hoặc STAFF cập nhật trạng thái ca làm (đã làm / nghỉ)
router.put(
    "/api/update-schedule-status",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    scheduleController.updateStatus
);
router.post(
    "/api/create-schedules",
    // authMiddleware,
    scheduleController.create
);

// ADMIN xác nhận hoặc từ chối ca làm
router.put(
    "/api/admin/update-schedule/:id",
    authMiddleware,
    adminMiddleware,
    scheduleController.updateScheduleStatusByAdmin
);

export default router;
