import express from "express";
import serviceController from "../controllers/serviceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// CREATE
router.post(
    "/api/service/create",
    authMiddleware,
    roleMiddleware(["admin"]),
    serviceController.createService
);

// GET ALL
router.get("/api/service/get-all", serviceController.getAllServices);

// GET BY ID
router.get("/api/service/get-by-id", serviceController.getServiceById);

// GET BY CATEGORY
router.get(
    "/api/service/get-by-category",
    serviceController.getServicesByCategory
);

// UPDATE
router.put(
    "/api/service/update",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    serviceController.updateService
);

// DELETE
router.delete(
    "/api/service/soft-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    serviceController.softDeleteService
);

router.delete(
    "/api/service/hard-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    serviceController.hardDeleteService
);

export default router;
