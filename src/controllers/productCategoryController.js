import ProductCategoryService from "../services/ProductCategoryService.js";

let createCategory = async (req, res) => {
    try {
        const result = await ProductCategoryService.createCategory(req.body);
        return res.status(201).json({
            errCode: 0,
            errMessage: "Category created successfully",
            category: result,
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

let getAllCategories = async (req, res) => {
    try {
        const categories = await ProductCategoryService.getAllCategories();
        return res.status(200).json({
            errCode: 0,
            categories,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getCategoryById = async (req, res) => {
    try {
        const { productCategories_id } = req.query;
        const category =
            await ProductCategoryService.getCategoryById(productCategories_id);

        if (!category) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Category not found",
            });
        }

        return res.status(200).json({
            errCode: 0,
            category,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let updateCategory = async (req, res) => {
    try {
        const { productCategories_id } = req.query;
        const result = await ProductCategoryService.updateCategory(
            productCategories_id,
            req.body,
        );

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

let softDeleteCategory = async (req, res) => {
    try {
        const { category_id } = req.query;
        const result =
            await ProductCategoryService.softDeleteCategory(category_id);

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

let hardDeleteCategory = async (req, res) => {
    try {
        const { productCategories_id } = req.query;
        await ProductCategoryService.hardDeleteCategory(productCategories_id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Category hard deleted successfully",
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
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    softDeleteCategory,
    hardDeleteCategory,
};
