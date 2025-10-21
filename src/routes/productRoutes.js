// src/routes/productRoutes.js
import express from "express";
import productController from "../controllers/productController";

let router = express.Router();

// CREATE
router.post("/api/create-new-product", productController.createProduct);

// READ ALL
router.get("/api/get-all-products", productController.getAllProducts);

// READ ONE
router.get("/api/get-product-by-id", productController.getProductById);

// UPDATE
router.get("/api/update-product", productController.updateProduct);

// DELETE
router.get("/api/delete-product", productController.deleteProduct);

export default router;
