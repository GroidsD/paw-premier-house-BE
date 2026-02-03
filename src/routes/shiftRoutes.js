import express from "express";
import shiftController from "../controllers/shiftController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

/* ======================================================
   CREATE SHIFT
   Permission: shift:create
====================================================== */
router.post(
    "/api/create-shifts",
    authMiddleware,
    permissionMiddleware({
        all: ["shift:create"],
    }),
    shiftController.create,
);

/* ======================================================
   GET ALL SHIFTS
   Permission: shift:read
====================================================== */
router.get(
    "/api/get-all-shifts",
    authMiddleware,
    permissionMiddleware({
        all: ["shift:read"],
    }),
    shiftController.getAll,
);

/* ======================================================
   GET SHIFT BY ID
   Permission: shift:read
====================================================== */
router.get(
    "/api/get-shift/:shift_id",
    authMiddleware,
    permissionMiddleware({
        all: ["shift:read"],
    }),
    shiftController.getById,
);

/* ======================================================
   UPDATE SHIFT
   Permission: shift:update
====================================================== */
router.put(
    "/api/update-shift/:shift_id",
    authMiddleware,
    permissionMiddleware({
        all: ["shift:update"],
    }),
    shiftController.update,
);

/* ======================================================
   DELETE SHIFT
   Permission: shift:delete
====================================================== */
router.delete(
    "/api/delete-shift/:shift_id",
    authMiddleware,
    permissionMiddleware({
        all: ["shift:delete"],
    }),
    shiftController.delete,
);

export default router;
