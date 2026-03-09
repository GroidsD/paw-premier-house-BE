import ServiceFeatureService from "../services/ServiceFeatureService.js";

let addFeature = async (req, res) => {
    try {
        const { service_id, feature_id } = req.body;

        const result = await ServiceFeatureService.addFeatureToService(
            service_id,
            feature_id,
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

let removeFeature = async (req, res) => {
    try {
        const { service_id, feature_id } = req.body;

        const result = await ServiceFeatureService.removeFeatureFromService(
            service_id,
            feature_id,
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

let getFeaturesByService = async (req, res) => {
    try {
        const service_id = req.query.service_id;

        const result =
            await ServiceFeatureService.getFeaturesByService(service_id);

        return res.status(200).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

export default {
    addFeature,
    removeFeature,
    getFeaturesByService,
};
