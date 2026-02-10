import express from "express";
import productCategoryController from "../controllers/productCategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

/* ======================================================
   PRODUCT CATEGORY ROUTES (RBAC - permission based)
====================================================== */

// CREATE - Tạo category mới
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

// READ ALL - Lấy tất cả category
router.get(
    "/api/product-categories/get-all",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["category:read"],
    }),
    productCategoryController.getAllCategories,
);

// READ ONE - Lấy category theo ID
router.get(
    "/api/product-categories/get-by-id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["category:read"],
    }),
    productCategoryController.getCategoryById,
);

// UPDATE - Cập nhật category
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

// SOFT DELETE - xóa mềm (ADMIN)
router.delete(
    "/api/product-categories/soft-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "category:delete"],
    }),
    productCategoryController.softDeleteCategory,
);

// HARD DELETE - xóa cứng (ADMIN ONLY)
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
