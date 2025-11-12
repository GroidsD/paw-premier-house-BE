import productService from "../services/ProductService.js";

// CREATE - Tạo sản phẩm mới
let createProduct = async (req, res) => {
    try {
        const result = await productService.createProduct(req.body);
        return res.status(201).json({
            errCode: 0,
            errMessage: "Product created successfully",
            product: result,
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

// READ ALL - Lấy tất cả sản phẩm
let getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        return res.status(200).json({
            errCode: 0,
            products,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// READ ONE - Lấy sản phẩm theo ID
let getProductById = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const product = await productService.getProductById(product_id);

        if (!product) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Product not found",
            });
        }

        return res.status(200).json({
            errCode: 0,
            product,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// UPDATE - Cập nhật sản phẩm
let updateProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const updated = await productService.updateProduct(
            product_id,
            req.body
        );
        if (!updated) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Product not found",
                product: null,
            });
        }
        return res.status(200).json({
            errCode: updated.errCode,
            errMessage: updated.errMessage,
            product: updated.product,
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

// SOFT DELETE - đổi status thành deleted
let softDeleteProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const result = await productService.softDeleteProduct(product_id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Product soft deleted successfully",
            product: result,
        });
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

// HARD DELETE - xóa hoàn toàn sản phẩm
let hardDeleteProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const result = await productService.hardDeleteProduct(product_id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Product hard deleted successfully",
        });
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

export default {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    softDeleteProduct,
    hardDeleteProduct,
};
