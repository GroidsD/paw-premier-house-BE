import express from "express";
import productCategoryController from "../controllers/productCategoryController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// CREATE - Tạo category mới
router.post(
    "/api/product-categories/create",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    productCategoryController.createCategory
);

// READ ALL - Lấy tất cả category
router.get(
    "/api/product-categories/get-all",
    productCategoryController.getAllCategories
);

// READ ONE - Lấy category theo ID
router.get(
    "/api/product-categories/get-by-id",
    productCategoryController.getCategoryById
);

// UPDATE - Cập nhật category
router.put(
    "/api/product-categories/update",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    productCategoryController.updateCategory
);

// SOFT DELETE - xóa mềm
router.delete(
    "/api/product-categories/soft-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    productCategoryController.softDeleteCategory
);

// HARD DELETE - xóa cứng
router.delete(
    "/api/product-categories/hard-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    productCategoryController.hardDeleteCategory
);

export default router;
