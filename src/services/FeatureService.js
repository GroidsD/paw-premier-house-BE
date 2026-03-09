import db from "../models/index.js";

let createFeature = async (data) => {
    try {
        const { feature_name, serviceCategories_id, icon, description } = data;

        const feature = await db.Feature.create({
            feature_name,
            serviceCategories_id,
            icon,
            description,
        });

        const featureWithRelation = await db.Feature.findByPk(
            feature.feature_id,
            {
                include: [
                    {
                        model: db.ServiceCategory,
                        as: "category",
                        attributes: ["serviceCategories_id", "type"],
                    },
                ],
            },
        );

        return {
            errCode: 0,
            errMessage: "Feature created successfully",
            feature: featureWithRelation,
        };
    } catch (e) {
        throw e;
    }
};

let getAllFeatures = async () => {
    try {
        const features = await db.Feature.findAll({
            attributes: [
                "feature_id",
                "feature_name",
                "icon",
                "description",
                "created_at",
            ],
            include: [
                {
                    model: db.ServiceCategory,
                    as: "category",
                    attributes: ["serviceCategories_id", "type"],
                },
                {
                    model: db.Service,
                    as: "services",
                    attributes: ["service_id", "name"],
                    through: { attributes: [] },
                },
            ],
            order: [["feature_id", "ASC"]],
        });

        return {
            errCode: 0,
            features,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let getFeatureById = async (feature_id) => {
    try {
        const feature = await db.Feature.findByPk(feature_id, {
            include: [
                {
                    model: db.ServiceCategory,
                    as: "category",
                    attributes: ["serviceCategories_id", "type"],
                },
                {
                    model: db.Service,
                    as: "services",
                    attributes: ["service_id", "name"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!feature) {
            return {
                errCode: 1,
                errMessage: "Feature not found",
            };
        }

        return {
            errCode: 0,
            feature,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let getFeaturesByCategory = async (serviceCategories_id) => {
    try {
        const features = await db.Feature.findAll({
            where: { serviceCategories_id },
            attributes: ["feature_id", "feature_name", "icon", "description"],
            order: [["feature_id", "ASC"]],
        });

        return {
            errCode: 0,
            features,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let getFeaturesForService = async (service_id, serviceCategories_id) => {
    try {
        const features = await db.Feature.findAll({
            where: { serviceCategories_id },
            attributes: ["feature_id", "feature_name", "icon", "description"],
            include: [
                {
                    model: db.Service,
                    as: "services",
                    attributes: ["service_id"],
                    where: { service_id },
                    required: false,
                    through: { attributes: [] },
                },
            ],
        });

        const formatted = features.map((f) => ({
            feature_id: f.feature_id,
            feature_name: f.feature_name,
            icon: f.icon,
            description: f.description,
            assigned: f.services.length > 0,
        }));

        return {
            errCode: 0,
            features: formatted,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let updateFeature = async (feature_id, data) => {
    try {
        const feature = await db.Feature.findByPk(feature_id);

        if (!feature) {
            return {
                errCode: 1,
                errMessage: "Feature not found",
            };
        }

        await feature.update(data);

        return {
            errCode: 0,
            errMessage: "Feature updated successfully",
            feature,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let deleteFeature = async (feature_id) => {
    try {
        const feature = await db.Feature.findByPk(feature_id);

        if (!feature) throw "Feature not found";

        await db.ServiceFeature.destroy({
            where: { feature_id },
        });

        await feature.destroy({ force: true });

        return {
            errCode: 0,
            errMessage: "Feature deleted successfully",
        };
    } catch (e) {
        throw e;
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
