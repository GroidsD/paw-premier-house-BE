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
//         let product = await productService.getProductById(req.params.id);
//         return res.status(200).json(product);
//     } catch (e) {
//         return res.status(404).json({ message: e.toString() });
//     }
// };

// let updateProduct = async (req, res) => {
//     try {
//         let updated = await productService.updateProduct(
//             req.params.id,
//             req.body
//         );
//         return res.status(200).json(updated);
//     } catch (e) {
//         return res.status(400).json({ message: e.toString() });
//     }
// };

// let deleteProduct = async (req, res) => {
//     try {
//         let result = await productService.deleteProduct(req.params.id);
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
import {
  createProduct as svcCreateProduct,
  getAllProducts as svcGetAllProducts,
  getProductById as svcGetProductById,
  updateProduct as svcUpdateProduct,
  deleteProduct as svcDeleteProduct,
} from "../services/ProductService.js";

let createProduct = async (req, res) => {
  try {
    let product = await svcCreateProduct(req.body);
    return res.status(201).json(product);
  } catch (e) {
    return res.status(400).json({ message: e.toString() });
  }
};

let getAllProducts = async (req, res) => {
  try {
    let products = await svcGetAllProducts();
    return res.status(200).json(products);
  } catch (e) {
    return res.status(500).json({ message: e.toString() });
  }
};

let getProductById = async (req, res) => {
  try {
    let product = await svcGetProductById(req.params.id);
    return res.status(200).json(product);
  } catch (e) {
    return res.status(404).json({ message: e.toString() });
  }
};

let updateProduct = async (req, res) => {
  try {
    let updated = await svcUpdateProduct(req.params.id, req.body);
    return res.status(200).json(updated);
  } catch (e) {
    return res.status(400).json({ message: e.toString() });
  }
};

let deleteProduct = async (req, res) => {
  try {
    let result = await svcDeleteProduct(req.params.id);
    return res.status(200).json({ message: result });
  } catch (e) {
    return res.status(404).json({ message: e.toString() });
  }
};

export default {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
