// src/routes/productRoutes.js
import express from "express";
import productController from "../controllers/productController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

import { multiUpload } from "./../middleware/uploadImageProducts.js";
const router = express.Router();

// CREATE - Tạo sản phẩm mới
router.post(
    "/api/products/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["product:create"],
    }),
    multiUpload,
    productController.createProduct,
);

// READ ALL - Lấy tất cả sản phẩm
router.get("/api/products/get-all", productController.getAllProducts);

// READ ONE - Lấy sản phẩm theo ID
router.get("/api/products/get-by-id", productController.getProductById);

// UPDATE - Cập nhật sản phẩm
router.put(
    "/api/products/update",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["product:update"],
    }),
    multiUpload,
    productController.updateProduct,
);

// SOFT DELETE - đổi status thành deleted
router.delete(
    "/api/products/soft-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["product:delete"],
    }),
    productController.softDeleteProduct,
);

// HARD DELETE - xóa hoàn toàn sản phẩm
router.delete(
    "/api/products/hard-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "product:delete"],
    }),
    productController.hardDeleteProduct,
);

export default router;
