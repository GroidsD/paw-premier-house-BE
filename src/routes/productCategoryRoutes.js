import express from "express";
import productCategoryController from "../controllers/productCategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
    "/api/product-categories/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["category:create"],
    }),
    productCategoryController.createCategory,
);

router.get(
    "/api/product-categories/get-all",

    productCategoryController.getAllCategories,
);

router.get(
    "/api/product-categories/get-by-id",

    productCategoryController.getCategoryById,
);

router.put(
    "/api/product-categories/update",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["category:update"],
    }),
    productCategoryController.updateCategory,
);

router.delete(
    "/api/product-categories/soft-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "category:delete"],
    }),
    productCategoryController.softDeleteCategory,
);

router.delete(
    "/api/product-categories/hard-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "category:delete"],
    }),
    productCategoryController.hardDeleteCategory,
);

export default router;
