import express from "express";
import scheduleController from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// STAFF xem lịch làm của mình
// GET http://localhost:5050/api/get-my-schedule
router.get(
    "/api/get-my-schedule",
    authMiddleware,
    scheduleController.getMySchedule
);

// ADMIN xem tất cả lịch làm (có filter: staff_id, from, to, status)
// GET http://localhost:5050/api/get-all-schedules?staff_id=&from=&to=&status=
router.get(
    "/api/get-all-schedules",
    authMiddleware,
    adminMiddleware,
    scheduleController.getAllSchedules
);

// ADMIN hoặc STAFF cập nhật trạng thái ca làm (đã làm / nghỉ)
// PUT http://localhost:5050/api/update-schedule-status
router.put(
    "/api/admin/update-schedule/:id",
    authMiddleware,
    adminMiddleware,
    scheduleController.updateScheduleStatusByAdmin
);
// Tạo schedule mới
// POST http://localhost:5050/api/create-schedules
router.post(
    "/api/create-schedules",
    authMiddleware,
    roleMiddleware(["admin", "staff"]), // gọi hàm đúng cách
    scheduleController.createSchedule
);

// ADMIN xác nhận hoặc từ chối ca làm
// PUT http://localhost:5050/api/admin/update-schedule/:id
router.put(
    "/api/admin/update-schedule/:id",
    authMiddleware,
    adminMiddleware,
    scheduleController.updateScheduleStatusByAdmin
);

// Xóa schedule
// DELETE http://localhost:5050/api/delete-schedule/:id
router.delete(
    "/api/delete-schedule/:id",
    authMiddleware,
    adminMiddleware,
    scheduleController.deleteSchedule
);

export default router;
