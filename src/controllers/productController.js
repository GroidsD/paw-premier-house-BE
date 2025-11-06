// import productService from "../services/ProductService.js";

// let createProduct = async (req, res) => {
//     try {
//         let product = await productService.createProduct(req.body);
//         return res.status(201).json(product);
//     } catch (e) {
//         return res.status(400).json({ message: e.toString() });
//     }
// };

// let getAllProducts = async (req, res) => {
//     try {
//         let products = await productService.getAllProducts();

//         return res.status(200).json(products);
//     } catch (e) {
//         return res.status(500).json({ message: e.toString() });
//     }
// };

// let getProductById = async (req, res) => {
//     try {
//         let product = await productService.getProductById(req.query.id);
//         return res.status(200).json(product);
//     } catch (e) {
//         return res.status(404).json({ message: e.toString() });
//     }
// };

// let updateProduct = async (req, res) => {
//     try {
//         let updated = await productService.updateProduct(
//             req.query.id,
//             req.body
//         );
//         return res.status(200).json(updated);
//     } catch (e) {
//         return res.status(400).json({ message: e.toString() });
//     }
// };

// let deleteProduct = async (req, res) => {
//     try {
//         let result = await productService.deleteProduct(req.query.id);
//         return res.status(200).json({ message: result });
//     } catch (e) {
//         return res.status(404).json({ message: e.toString() });
//     }
// };

// export default {
//     createProduct,
//     getAllProducts,
//     getProductById,
//     updateProduct,
//     deleteProduct,
// };
