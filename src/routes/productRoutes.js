// // src/routes/productRoutes.js
// import express from "express";
// import productController from "../controllers/productController";
// import authMiddleware from "../middleware/authMiddleware";
// import adminMiddleware from "../middleware/adminMiddleware";
// import roleMiddleware from "../middleware/roleMiddleware";

// let router = express.Router();

// // CREATE
// router.post(
//   "/api/create-new-product",
//   // authMiddleware,
//   productController.createProduct
// );

// // READ ALL
// router.get(
//   "/api/get-all-products",
//   //   authMiddleware,
//   productController.getAllProducts
// );

// // READ ONE
// router.get(
//   "/api/get-product-by-id",
//   // authMiddleware,
//   productController.getProductById
// );

// // UPDATE
// router.get(
//   "/api/update-product",
//   // authMiddleware,
//   productController.updateProduct
// );

// // DELETE
// router.get(
//   "/api/delete-product",
//   adminMiddleware,
//   productController.deleteProduct
// );

// export default router;
