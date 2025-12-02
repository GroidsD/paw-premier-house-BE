import express from "express";
import scheduleController from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Lấy schedule
router.get("/api/schedules/get-all", authMiddleware, scheduleController.getAll);
router.get(
    "/api/schedules/:schedule_id",
    authMiddleware,
    scheduleController.getById
);

router.get(
    "/api/schedules/my-schedule",
    authMiddleware,
    scheduleController.getMySchedule
);
// Staff đăng ký
router.post(
    "/api/schedules/register",
    authMiddleware,
    scheduleController.register
);

router.post(
    "/api/schedules/create-weekly",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.createWeekly
);
// Manager approve/reject
router.patch(
    "/api/schedules/:schedule_id/approve",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.approve
);

// Manager chuyển ca
router.patch(
    "/api/schedules/:schedule_id/replace",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.replace
);

// Update/Delete (admin/manager)
router.put(
    "/api/schedules/:schedule_id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.update
);
router.delete(
    "/api/schedules/:schedule_id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    scheduleController.delete
);

export default router;
