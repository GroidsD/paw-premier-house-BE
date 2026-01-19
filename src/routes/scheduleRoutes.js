import express from "express";
import scheduleController from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// SCHEDULE (bảng schedules)
// Lấy toàn bộ schedule
router.get("/api/schedules/get-all", authMiddleware, scheduleController.getAll);

// Lấy lịch của chính staff đang đăng nhập
router.get(
    "/api/schedules/my-schedule",
    authMiddleware,
    scheduleController.getMySchedule
);

// Lấy chi tiết 1 schedule
router.get(
    "/api/schedules/:schedule_id",
    authMiddleware,
    scheduleController.getById
);

// Staff đăng ký ca
router.post(
    "/api/schedules/register",
    authMiddleware,
    scheduleController.register
);

// Tạo lịch theo tuần
router.post(
    "/api/schedules/create-weekly",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.createWeekly
);

// Mở lịch theo tuần (open schedule)
router.put(
    "/api/schedules/open-week",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.openWeekSchedules
);

// Update schedule
router.put(
    "/api/schedules/:schedule_id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.update
);

// Xóa schedule
router.delete(
    "/api/schedules/:schedule_id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.delete
);

//  SCHEDULE STAFF (bảng schedule_staff)

// Approve / Reject đăng ký
router.patch(
    "/api/schedule-staff/:schedule_staff_id/approve",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.approve
);

// Replace staff (thay thế nhân viên)
router.patch(
    "/api/schedule-staff/:schedule_staff_id/replace",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.replace
);

export default router;
