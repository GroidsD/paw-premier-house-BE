import express from "express";
import shiftController from "../controllers/shiftController";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";

let router = express.Router();

// CREATE SHIFT (chỉ admin)
router.post(
    "/api/create-shift",
    authMiddleware,
    adminMiddleware,
    shiftController.create
);

// GET ALL SHIFTS (ai cũng có thể xem)
router.get("/api/get-all-shifts", authMiddleware, shiftController.getAll);

export default router;
