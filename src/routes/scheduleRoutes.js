import express from "express";
import scheduleController from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

/* ======================================================
   SCHEDULE ROUTES (RBAC - permission based)
====================================================== */

// ============================
// GET ALL SCHEDULES
// ============================
router.get(
    "/api/schedules/get-all",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:read"],
    }),
    scheduleController.getAll,
);

// ============================
// GET MY SCHEDULE (STAFF)
// ============================
router.get(
    "/api/schedules/my-schedule",
    authMiddleware,
    permissionMiddleware({
        all: ["schedule:read"],
    }),
    scheduleController.getMySchedule,
);
router.get(
    "/api/schedules/by-week",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:read"],
    }),
    scheduleController.getSchedulesByWeek,
);
// ============================
// GET SCHEDULE BY ID
// ============================
router.get(
    "/api/schedules/:schedule_id",
    authMiddleware,
    permissionMiddleware({
        all: ["schedule:read"],
    }),
    scheduleController.getById,
);

// ============================
// STAFF REGISTER SHIFT
// ============================
router.post(
    "/api/schedules/register",
    authMiddleware,
    permissionMiddleware({
        all: ["schedule:create"],
    }),
    scheduleController.register,
);

// ============================
// CREATE WEEKLY SCHEDULE
// ============================
router.post(
    "/api/schedules/create-weekly",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:create"],
    }),
    scheduleController.createWeekly,
);

// ============================
// OPEN WEEK SCHEDULE
// ============================
router.put(
    "/api/schedules/open-week",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:update"],
    }),
    scheduleController.openWeekSchedules,
);

// ============================
// UPDATE SCHEDULE
// ============================
router.put(
    "/api/schedules/:schedule_id",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:update"],
    }),
    scheduleController.update,
);

// ============================
// DELETE SCHEDULE
// ============================
router.delete(
    "/api/schedules/:schedule_id",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:delete"],
    }),
    scheduleController.delete,
);

// ======================================================
// SCHEDULE STAFF (schedule_staff table)
// ======================================================

// ============================
// APPROVE / REJECT STAFF
// ============================
router.patch(
    "/api/schedule-staff/:schedule_staff_id/approve",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:approve"],
    }),
    scheduleController.approve,
);

// ============================
// REPLACE STAFF
// ============================
router.patch(
    "/api/schedule-staff/:schedule_staff_id/replace",
    authMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:replace"],
    }),
    scheduleController.replace,
);

export default router;
