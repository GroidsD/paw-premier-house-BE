import db from "../models/index.js";

let addFeatureToService = async (service_id, feature_id) => {
    try {
        const exist = await db.ServiceFeature.findOne({
            where: { service_id, feature_id },
        });

        if (exist) {
            return {
                errCode: 1,
                errMessage: "Feature already attached to service",
            };
        }

        const link = await db.ServiceFeature.create({
            service_id,
            feature_id,
        });

        return {
            errCode: 0,
            errMessage: "Feature added to service",
            data: link,
        };
    } catch (e) {
        throw e;
    }
};

let removeFeatureFromService = async (service_id, feature_id) => {
    try {
        const link = await db.ServiceFeature.findOne({
            where: { service_id, feature_id },
        });

        if (!link) {
            return {
                errCode: 1,
                errMessage: "Feature not attached to this service",
            };
        }

        await link.destroy();

        return {
            errCode: 0,
            errMessage: "Feature removed from service",
        };
    } catch (e) {
        throw e;
    }
};

let getFeaturesByService = async (service_id) => {
    try {
        const features = await db.Feature.findAll({
            include: [
                {
                    model: db.Service,
                    as: "services",
                    where: { service_id },
                    attributes: [],
                    through: { attributes: [] },
                },
            ],
        });

        return {
            errCode: 0,
            features,
        };
    } catch (e) {
        throw e;
    }
};

export default {
    addFeatureToService,
    removeFeatureFromService,
    getFeaturesByService,
};
