import serviceCategoryService from "../services/serviceCategoryService.js";

let createServiceCategory = async (req, res) => {
    try {
        const result = await serviceCategoryService.createServiceCategory(
            req.body,
        );

        return res.status(201).json({
            errCode: 0,
            errMessage: "Service category created successfully",
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

let getAllServiceCategories = async (req, res) => {
    try {
        const categories =
            await serviceCategoryService.getAllServiceCategories();

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

let getServiceCategoryById = async (req, res) => {
    try {
        const serviceCategories_id = req.query.serviceCategories_id;
        const category =
            await serviceCategoryService.getServiceCategoryById(
                serviceCategories_id,
            );

        if (!category) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Service category not found",
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

let updateServiceCategory = async (req, res) => {
    try {
        const serviceCategories_id = req.query.serviceCategories_id;
        const result = await serviceCategoryService.updateServiceCategory(
            serviceCategories_id,
            req.body,
        );

        if (result.errCode !== 0) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

let softDeleteServiceCategory = async (req, res) => {
    try {
        const id = req.query.serviceCategories_id;
        await serviceCategoryService.softDeleteServiceCategory(id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Service category soft deleted successfully",
        });
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

let hardDeleteServiceCategory = async (req, res) => {
    try {
        const id = req.query.serviceCategories_id;
        await serviceCategoryService.hardDeleteServiceCategory(id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Service category hard deleted successfully",
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
    createServiceCategory,
    getAllServiceCategories,
    getServiceCategoryById,
    updateServiceCategory,
    softDeleteServiceCategory,
    hardDeleteServiceCategory,
};
