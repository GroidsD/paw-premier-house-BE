import express from "express";
import serviceCategoryController from "../controllers/serviceCategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

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

router.get(
    "/api/service-category/get-all",
    serviceCategoryController.getAllServiceCategories,
);

router.get(
    "/api/service-category/get-by-id",
    serviceCategoryController.getServiceCategoryById,
);

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
