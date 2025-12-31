import express from "express";
import shiftController from "../controllers/shiftController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

let router = express.Router();

// CREATE SHIFT (admin + manager)
router.post(
    "/api/create-shift",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    shiftController.create
);

// GET ALL SHIFTS (ai cũng xem được)
router.get("/api/get-all-shifts", authMiddleware, shiftController.getAll);

// GET SHIFT BY ID
router.get("/api/get-shift/:shift_id", authMiddleware, shiftController.getById);

// UPDATE SHIFT (admin + manager)
router.put(
    "/api/update-shift/:shift_id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    shiftController.update
);

// DELETE SHIFT (admin + manager)
router.delete(
    "/api/delete-shift/:shift_id",
    authMiddleware,
    roleMiddleware(["admin", "manager"]),
    shiftController.delete
);

export default router;
