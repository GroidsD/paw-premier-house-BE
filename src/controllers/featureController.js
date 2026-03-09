import FeatureService from "../services/FeatureService.js";

let createFeature = async (req, res) => {
    try {
        const data = { ...req.body };

        const result = await FeatureService.createFeature(data);

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: e.message || "Server error",
        });
    }
};

let getAllFeatures = async (req, res) => {
    try {
        const result = await FeatureService.getAllFeatures();

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getFeatureById = async (req, res) => {
    try {
        const feature_id = req.query.feature_id;

        const result = await FeatureService.getFeatureById(feature_id);

        if (result.errCode !== 0) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);

        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getFeaturesByCategory = async (req, res) => {
    try {
        const serviceCategories_id = req.query.serviceCategories_id;

        const result =
            await FeatureService.getFeaturesByCategory(serviceCategories_id);

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);

        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getFeaturesForService = async (req, res) => {
    try {
        const { service_id, serviceCategories_id } = req.query;

        const result = await FeatureService.getFeaturesForService(
            service_id,
            serviceCategories_id,
        );

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);

        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let updateFeature = async (req, res) => {
    try {
        const feature_id = req.query.feature_id;

        const result = await FeatureService.updateFeature(feature_id, req.body);

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);

        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let deleteFeature = async (req, res) => {
    try {
        const feature_id = req.query.feature_id;

        const result = await FeatureService.deleteFeature(feature_id);

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);

        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

export default {
    createFeature,
    getAllFeatures,
    getFeatureById,
    getFeaturesByCategory,
    getFeaturesForService,
    updateFeature,
    deleteFeature,
};
