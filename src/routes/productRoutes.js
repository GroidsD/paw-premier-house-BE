// src/routes/productRoutes.js
import express from "express";
import productController from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE - Tạo sản phẩm mới
router.post(
    "/api/products/create",
    // authMiddleware,
    productController.createProduct
);

// READ ALL - Lấy tất cả sản phẩm
router.get(
    "/api/products/get-all",
    // authMiddleware,
    productController.getAllProducts
);

// READ ONE - Lấy sản phẩm theo ID
router.get(
    "/api/products/get-by-id",
    // authMiddleware,
    productController.getProductById
);

// UPDATE - Cập nhật sản phẩm
router.put(
    "/api/products/update",
    // authMiddleware,
    productController.updateProduct
);

// SOFT DELETE - đổi status thành deleted
router.delete(
    "/api/products/soft-delete",
    // authMiddleware,
    productController.softDeleteProduct
);

// HARD DELETE - xóa hoàn toàn sản phẩm
router.delete(
    "/api/products/hard-delete",
    // authMiddleware,
    productController.hardDeleteProduct
);

export default router;
