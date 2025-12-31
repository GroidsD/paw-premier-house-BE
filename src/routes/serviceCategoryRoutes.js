import express from "express";
import serviceCategoryController from "../controllers/serviceCategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// ============================
// CREATE
// ============================
router.post(
    "/api/service-category/create",
    authMiddleware,
    roleMiddleware(["admin"]),
    serviceCategoryController.createServiceCategory
);

// ============================
// GET ALL
// ============================
router.get(
    "/api/service-category/get-all",
    serviceCategoryController.getAllServiceCategories
);

// ============================
// GET BY ID
// ============================
router.get(
    "/api/service-category/get-by-id",
    serviceCategoryController.getServiceCategoryById
);

// ============================
// UPDATE
// ============================
router.put(
    "/api/service-category/update",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    serviceCategoryController.updateServiceCategory
);

// ============================
// SOFT DELETE
// ============================
router.delete(
    "/api/service-category/soft-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    serviceCategoryController.softDeleteServiceCategory
);

// ============================
// HARD DELETE
// ============================
router.delete(
    "/api/service-category/hard-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    serviceCategoryController.hardDeleteServiceCategory
);

export default router;
