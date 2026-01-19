// src/routes/productRoutes.js
import express from "express";
import productController from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// CREATE - Tạo sản phẩm mới
router.post(
    "/api/products/create",
    authMiddleware,
    productController.createProduct
);

// READ ALL - Lấy tất cả sản phẩm
router.get("/api/products/get-all", productController.getAllProducts);

// READ ONE - Lấy sản phẩm theo ID
router.get("/api/products/get-by-id", productController.getProductById);

// UPDATE - Cập nhật sản phẩm
router.put(
    "/api/products/update",
    authMiddleware,
    roleMiddleware(["admin", "staff"]),
    productController.updateProduct
);

// SOFT DELETE - đổi status thành deleted
router.delete(
    "/api/products/soft-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    productController.softDeleteProduct
);

// HARD DELETE - xóa hoàn toàn sản phẩm
router.delete(
    "/api/products/hard-delete",
    authMiddleware,
    roleMiddleware(["admin"]),
    productController.hardDeleteProduct
);

export default router;
