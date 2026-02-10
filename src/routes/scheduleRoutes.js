import express from "express";
import scheduleController from "../controllers/scheduleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
    "/api/schedules/get-all",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:read"],
    }),
    scheduleController.getAll,
);

router.get(
    "/api/schedules/my-schedule",
    authMiddleware,
    rbacMiddleware,
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

router.get(
    "/api/schedules/:schedule_id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["schedule:read"],
    }),
    scheduleController.getById,
);

router.post(
    "/api/schedules/register",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["schedule:create"],
    }),
    scheduleController.register,
);

router.post(
    "/api/schedules/create-weekly",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:create"],
    }),
    scheduleController.createWeekly,
);

router.put(
    "/api/schedules/open-week",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:update"],
    }),
    scheduleController.openWeekSchedules,
);

router.put(
    "/api/schedules/:schedule_id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:update"],
    }),
    scheduleController.update,
);

router.delete(
    "/api/schedules/:schedule_id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:delete"],
    }),
    scheduleController.delete,
);

router.patch(
    "/api/schedule-staff/:schedule_staff_id/approve",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:approve"],
    }),
    scheduleController.approve,
);

router.patch(
    "/api/schedule-staff/:schedule_staff_id/replace",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["schedule:replace"],
    }),
    scheduleController.replace,
);

export default router;
