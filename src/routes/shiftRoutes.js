import express from "express";
import shiftController from "../controllers/shiftController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();


router.post(
    "/api/create-shifts",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["shift:create"],
    }),
    shiftController.create,
);


router.get(
    "/api/get-all-shifts",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["shift:read"],
    }),
    shiftController.getAll,
);


router.get(
    "/api/get-shift/:shift_id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["shift:read"],
    }),
    shiftController.getById,
);


router.put(
    "/api/update-shift/:shift_id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["shift:update"],
    }),
    shiftController.update,
);


router.delete(
    "/api/delete-shift/:shift_id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["shift:delete"],
    }),
    shiftController.delete,
);

export default router;
