import db from "../models/index.js";

let createFeature = async (data) => {
    try {
        const {
            feature_name_vi,
            feature_name_en,
            serviceCategories_id,
            icon,
            description_vi,
            description_en,
        } = data;

        const feature = await db.Feature.create({
            feature_name_vi,
            feature_name_en: feature_name_en || feature_name_vi,
            serviceCategories_id,
            icon,
            description_vi,
            description_en: description_en || description_vi,
        });

        const featureWithRelation = await db.Feature.findByPk(
            feature.feature_id,
            {
                attributes: [
                    "feature_id",
                    "feature_name_vi",
                    "feature_name_en",
                    "serviceCategories_id",
                    "icon",
                    "description_vi",
                    "description_en",
                    "created_at",
                    "updated_at",
                ],
                include: [
                    {
                        model: db.ServiceCategory,
                        as: "category",
                        attributes: ["serviceCategories_id", "type"],
                    },
                ],
            },
        );

        const plainFeature = featureWithRelation.get({ plain: true });

        return {
            errCode: 0,
            errMessage: "Feature created successfully",
            feature: {
                ...plainFeature,
                feature_name: plainFeature.feature_name_vi,
                description: plainFeature.description_vi,
                feature_name_vi: undefined,
                feature_name_en: undefined,
                description_vi: undefined,
                description_en: undefined,
            },
        };
    } catch (e) {
        throw e;
    }
};

let getAllFeatures = async (lang = "vi") => {
    try {
        const features = await db.Feature.findAll({
            attributes: [
                "feature_id",
                "feature_name_vi",
                "feature_name_en",
                "icon",
                "description_vi",
                "description_en",
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
                    attributes: ["service_id", "name_vi", "name_en"],
                    through: { attributes: [] },
                },
            ],
            order: [["feature_id", "ASC"]],
        });

        // Map response fields based on language
        const mappedFeatures = features.map((feature) => {
            const plainFeature = feature.get({ plain: true });
            return {
                ...plainFeature,
                feature_name:
                    lang === "en"
                        ? plainFeature.feature_name_en ||
                          plainFeature.feature_name_vi
                        : plainFeature.feature_name_vi,
                description:
                    lang === "en"
                        ? plainFeature.description_en ||
                          plainFeature.description_vi
                        : plainFeature.description_vi,
                // Remove multilingual fields from response
                feature_name_vi: undefined,
                feature_name_en: undefined,
                description_vi: undefined,
                description_en: undefined,
            };
        });

        return {
            errCode: 0,
            features: mappedFeatures,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let getFeatureById = async (feature_id, lang = "vi") => {
    try {
        const feature = await db.Feature.findByPk(feature_id, {
            attributes: [
                "feature_id",
                "feature_name_vi",
                "feature_name_en",
                "serviceCategories_id",
                "icon",
                "description_vi",
                "description_en",
                "created_at",
                "updated_at",
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
                    attributes: ["service_id", "name_vi", "name_en"],
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

        // Map response fields based on language
        const plainFeature = feature.get({ plain: true });
        const mappedFeature = {
            ...plainFeature,
            feature_name:
                lang === "en"
                    ? plainFeature.feature_name_en ||
                      plainFeature.feature_name_vi
                    : plainFeature.feature_name_vi,
            description:
                lang === "en"
                    ? plainFeature.description_en || plainFeature.description_vi
                    : plainFeature.description_vi,
            // Remove multilingual fields from response
            feature_name_vi: undefined,
            feature_name_en: undefined,
            description_vi: undefined,
            description_en: undefined,
        };

        return {
            errCode: 0,
            feature: mappedFeature,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let getFeaturesByCategory = async (serviceCategories_id, lang = "vi") => {
    try {
        const features = await db.Feature.findAll({
            where: { serviceCategories_id },
            attributes: [
                "feature_id",
                "feature_name_vi",
                "feature_name_en",
                "icon",
                "description_vi",
                "description_en",
            ],
            order: [["feature_id", "ASC"]],
        });

        // Map response fields based on language
        const mappedFeatures = features.map((feature) => {
            const plainFeature = feature.get({ plain: true });
            return {
                ...plainFeature,
                feature_name:
                    lang === "en"
                        ? plainFeature.feature_name_en ||
                          plainFeature.feature_name_vi
                        : plainFeature.feature_name_vi,
                description:
                    lang === "en"
                        ? plainFeature.description_en ||
                          plainFeature.description_vi
                        : plainFeature.description_vi,
                // Remove multilingual fields from response
                feature_name_vi: undefined,
                feature_name_en: undefined,
                description_vi: undefined,
                description_en: undefined,
            };
        });

        return {
            errCode: 0,
            features: mappedFeatures,
        };
    } catch (e) {
        return {
            errCode: -1,
            errMessage: e.message,
        };
    }
};

let getFeaturesForService = async (
    service_id,
    serviceCategories_id,
    lang = "vi",
) => {
    try {
        const features = await db.Feature.findAll({
            where: { serviceCategories_id },
            attributes: [
                "feature_id",
                "feature_name_vi",
                "feature_name_en",
                "icon",
                "description_vi",
                "description_en",
            ],
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

        const formatted = features.map((f) => {
            const plainFeature = f.get({ plain: true });
            return {
                feature_id: plainFeature.feature_id,
                feature_name:
                    lang === "en"
                        ? plainFeature.feature_name_en ||
                          plainFeature.feature_name_vi
                        : plainFeature.feature_name_vi,
                icon: plainFeature.icon,
                description:
                    lang === "en"
                        ? plainFeature.description_en ||
                          plainFeature.description_vi
                        : plainFeature.description_vi,
                assigned: plainFeature.services.length > 0,
            };
        });

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

        const updateData = {
            feature_name_vi: data.feature_name_vi,
            feature_name_en: data.feature_name_en,
            description_vi: data.description_vi,
            description_en: data.description_en,
            serviceCategories_id: data.serviceCategories_id,
            icon: data.icon,
        };

        await feature.update(updateData);

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
