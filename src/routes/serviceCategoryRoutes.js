import express from "express";
import serviceCategoryController from "../controllers/serviceCategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

/* ======================================================
   SERVICE CATEGORY ROUTES (RBAC - permission based)
====================================================== */

// ============================
// CREATE
// ============================
router.post(
    "/api/service-category/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["category:create"],
    }),
    serviceCategoryController.createServiceCategory,
);

// ============================
// GET ALL
// ============================
router.get(
    "/api/service-category/get-all",
    serviceCategoryController.getAllServiceCategories,
);

// ============================
// GET BY ID
// ============================
router.get(
    "/api/service-category/get-by-id",
    serviceCategoryController.getServiceCategoryById,
);

// ============================
// UPDATE
// ============================
router.put(
    "/api/service-category/update",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["category:update"],
    }),
    serviceCategoryController.updateServiceCategory,
);

// ============================
// SOFT DELETE
// ============================
router.delete(
    "/api/service-category/soft-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["category:delete"],
    }),
    serviceCategoryController.softDeleteServiceCategory,
);

// ============================
// HARD DELETE
// ============================
router.delete(
    "/api/service-category/hard-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "category:delete"],
    }),
    serviceCategoryController.hardDeleteServiceCategory,
);

export default router;
