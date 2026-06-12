import db from "../models/index.js";
import MediaService from "./MediaService.js";
import { safeUnlinkByUrl } from "../helper/safeUnlinkByUrl.js";
import { generateSlug } from "../utils/slug.js";

const normalizeIds = (value) => {
    if (Array.isArray(value)) return value.map(Number).filter(Boolean);

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed))
                return parsed.map(Number).filter(Boolean);
        } catch {
            return value
                .split(",")
                .map((id) => Number(id.trim()))
                .filter(Boolean);
        }
    }

    return [];
};

const mapFeatureByLang = (feature, lang = "vi") => ({
    feature_id: feature.feature_id,
    serviceCategories_id: feature.serviceCategories_id,
    icon: feature.icon,

    feature_name:
        lang === "en"
            ? feature.feature_name_en || feature.feature_name_vi
            : feature.feature_name_vi,

    description:
        lang === "en"
            ? feature.description_en || feature.description_vi
            : feature.description_vi,
});

const createService = async (data) => {
    const t = await db.sequelize.transaction();

    try {
        let baseSlug = generateSlug(data.name_vi);
        let slug = baseSlug;
        let count = 1;

        while (
            await db.Service.findOne({
                where: { slug },
                transaction: t,
            })
        ) {
            slug = `${baseSlug}-${count}`;
            count++;
        }

        const service = await db.Service.create(
            {
                serviceCategories_id: data.serviceCategories_id || null,
                name_vi: data.name_vi,
                name_en: data.name_en || data.name_vi,
                slug,
                description_vi: data.description_vi,
                description_en: data.description_en || data.description_vi,
                price: data.price,
                duration: data.duration,
            },
            { transaction: t },
        );

        // attach features
        const featureIds = normalizeIds(data.feature_ids);
        if (featureIds.length > 0) {
            await service.setFeatures(featureIds, { transaction: t });
        }
        // media
        if (Array.isArray(data.media) && data.media.length > 0) {
            await MediaService.createMediaForEntity(
                data.media,
                service.service_id,
                "service",
                t,
            );
        }

        await t.commit();

        const created = await db.Service.findByPk(service.service_id, {
            include: [
                { model: db.Media, as: "media" },
                {
                    model: db.Feature,
                    as: "features",
                    through: { attributes: [] },
                },
            ],
        });
        return {
            errCode: 0,
            errMessage: "Service created successfully",
            service: created,
        };
    } catch (error) {
        await t.rollback();
        console.error("❌ Error in createService:", error);
        return { errCode: 1, errMessage: error.message };
    }
};

const getAllServices = async (lang = "vi") => {
    try {
        const services = await db.Service.findAll({
            include: [
                {
                    model: db.ServiceCategory,
                    as: "category",
                },
                {
                    model: db.Media,
                    as: "media",
                },
                {
                    model: db.Feature,
                    as: "features",
                    through: { attributes: [] },
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // Map response fields based on language
        const mappedServices = services.map((service) => {
            const plainService = service.get({ plain: true });

            return {
                ...plainService,

                name:
                    lang === "en"
                        ? plainService.name_en || plainService.name_vi
                        : plainService.name_vi,

                description:
                    lang === "en"
                        ? plainService.description_en ||
                          plainService.description_vi
                        : plainService.description_vi,

                features: (plainService.features || []).map((feature) =>
                    mapFeatureByLang(feature, lang),
                ),

                name_vi: undefined,
                name_en: undefined,
                description_vi: undefined,
                description_en: undefined,
            };
        });

        return {
            errCode: 0,
            services: mappedServices,
        };
    } catch (error) {
        console.error("❌ Error in getAllServices:", error);
        return {
            errCode: 1,
            errMessage: "Failed to fetch services",
        };
    }
};

const getServiceById = async (id, lang = "vi") => {
    try {
        const service = await db.Service.findOne({
            where: {
                service_id: id,
                isDeleted: false,
            },
            include: [
                {
                    model: db.ServiceCategory,
                    as: "category",
                },
                {
                    model: db.Media,
                    as: "media",
                },
                {
                    model: db.Feature,
                    as: "features",
                    through: { attributes: [] },
                },
            ],
        });

        if (!service) {
            return {
                errCode: 1,
                errMessage: "Service not found",
                service: null,
            };
        }

        // Map response fields based on language
        const plainService = service.get({ plain: true });
        const mappedService = {
            ...plainService,

            name:
                lang === "en"
                    ? plainService.name_en || plainService.name_vi
                    : plainService.name_vi,

            description:
                lang === "en"
                    ? plainService.description_en || plainService.description_vi
                    : plainService.description_vi,

            features: (plainService.features || []).map((feature) =>
                mapFeatureByLang(feature, lang),
            ),

            name_vi: undefined,
            name_en: undefined,
            description_vi: undefined,
            description_en: undefined,
        };

        return {
            errCode: 0,
            service: mappedService,
        };
    } catch (error) {
        console.error("❌ Error in getServiceById:", error);
        return {
            errCode: 1,
            errMessage: "Failed to fetch service",
        };
    }
};

const getServiceBySlug = async (slug, lang = "vi") => {
    try {
        const service = await db.Service.findOne({
            where: {
                slug,
                isDeleted: false,
            },
            include: [
                {
                    model: db.ServiceCategory,
                    as: "category",
                },
                {
                    model: db.Media,
                    as: "media",
                },
                {
                    model: db.Feature,
                    as: "features",
                    through: { attributes: [] },
                },
            ],
        });

        if (!service) {
            return {
                errCode: 1,
                errMessage: "Service not found",
                service: null,
            };
        }

        // Map response fields based on language
        const plainService = service.get({ plain: true });
        const mappedService = {
            ...plainService,

            name:
                lang === "en"
                    ? plainService.name_en || plainService.name_vi
                    : plainService.name_vi,

            description:
                lang === "en"
                    ? plainService.description_en || plainService.description_vi
                    : plainService.description_vi,

            features: (plainService.features || []).map((feature) =>
                mapFeatureByLang(feature, lang),
            ),

            name_vi: undefined,
            name_en: undefined,
            description_vi: undefined,
            description_en: undefined,
        };

        return {
            errCode: 0,
            service: mappedService,
        };
    } catch (error) {
        console.error("❌ Error in getServiceBySlug:", error);

        return {
            errCode: 1,
            errMessage: "Failed to fetch service",
        };
    }
};

const getServicesByCategory = async (category_id, lang = "vi") => {
    try {
        const services = await db.Service.findAll({
            where: {
                serviceCategories_id: category_id,
            },
            include: [
                {
                    model: db.ServiceCategory,
                    as: "category",
                    attributes: [
                        "serviceCategories_id",
                        "type",
                        "isActive",
                        "isDeleted",
                    ],
                },
                {
                    model: db.Media,
                    as: "media",
                },
                {
                    model: db.Feature,
                    as: "features",
                    through: { attributes: [] },
                },
            ],
            order: [["created_at", "DESC"]],
        });

        // Map response fields based on language
        const mappedServices = services.map((service) => {
            const plainService = service.get({ plain: true });

            return {
                ...plainService,

                name:
                    lang === "en"
                        ? plainService.name_en || plainService.name_vi
                        : plainService.name_vi,

                description:
                    lang === "en"
                        ? plainService.description_en ||
                          plainService.description_vi
                        : plainService.description_vi,

                features: (plainService.features || []).map((feature) =>
                    mapFeatureByLang(feature, lang),
                ),

                name_vi: undefined,
                name_en: undefined,
                description_vi: undefined,
                description_en: undefined,
            };
        });

        return {
            errCode: 0,
            services: mappedServices,
        };
    } catch (error) {
        console.error("❌ Error in getServicesByCategory:", error);
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const updateService = async (id, data) => {
    const t = await db.sequelize.transaction();
    let oldMedia = [];
    let newUploadedMedia = [];

    try {
        const service = await db.Service.findByPk(id, {
            include: [{ model: db.Media, as: "media" }],
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!service || service.isDeleted) {
            await t.rollback();

            if (Array.isArray(data.media)) {
                for (const item of data.media) {
                    if (item?.url) await safeUnlinkByUrl(item.url);
                }
            }

            return { errCode: 1, errMessage: "Service not found" };
        }

        oldMedia = (service.media || []).map((m) => m.url).filter(Boolean);

        await service.update(
            {
                name_vi: data.name_vi ?? service.name_vi,
                name_en: data.name_en ?? service.name_en,
                description_vi: data.description_vi ?? service.description_vi,
                description_en: data.description_en ?? service.description_en,
                price: data.price ?? service.price,
                duration: data.duration ?? service.duration,
                serviceCategories_id:
                    data.serviceCategories_id ?? service.serviceCategories_id,
                isActive:
                    data.isActive !== undefined
                        ? data.isActive
                        : service.isActive,
            },
            { transaction: t },
        );

        if (data.feature_ids !== undefined) {
            const featureIds = normalizeIds(data.feature_ids);
            await service.setFeatures(featureIds, { transaction: t });
        }

        if (Array.isArray(data.media)) {
            newUploadedMedia = data.media.map((m) => m.url).filter(Boolean);

            await MediaService.updateMediaForEntity(
                data.media,
                id,
                "service",
                t,
            );
        }

        await t.commit();

        if (oldMedia.length > 0) {
            for (const url of oldMedia) {
                if (!newUploadedMedia.includes(url)) {
                    await safeUnlinkByUrl(url);
                }
            }
        }

        const updated = await db.Service.findByPk(id, {
            include: [
                { model: db.Media, as: "media" },
                {
                    model: db.Feature,
                    as: "features",
                    through: { attributes: [] },
                },
            ],
        });

        return {
            errCode: 0,
            errMessage: "Service updated successfully",
            service: updated,
        };
    } catch (error) {
        await t.rollback();

        if (Array.isArray(data.media)) {
            for (const item of data.media) {
                if (item?.url) await safeUnlinkByUrl(item.url);
            }
        }

        console.error("❌ Error in updateService:", error);
        return { errCode: 1, errMessage: error.message };
    }
};

const softDeleteService = async (id) => {
    try {
        const service = await db.Service.findByPk(id);
        if (!service) {
            return { errCode: 1, errMessage: "Service not found" };
        }

        await service.update({
            isActive: false,
            isDeleted: true,
        });

        return {
            errCode: 0,
            errMessage: "Service soft deleted successfully",
        };
    } catch (error) {
        console.error("❌ Error in softDeleteService:", error);
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const restoreService = async (id) => {
    try {
        const service = await db.Service.findByPk(id);
        if (!service) {
            return { errCode: 1, errMessage: "Service not found" };
        }

        if (!service.isDeleted) {
            return {
                errCode: 1,
                errMessage: "Service is not deleted, cannot restore",
            };
        }

        await service.update({
            isDeleted: false,
            isActive: true,
        });

        return {
            errCode: 0,
            errMessage: "Service restored successfully",
        };
    } catch (error) {
        console.error("❌ Error in restoreService:", error);
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const hardDeleteService = async (id) => {
    const t = await db.sequelize.transaction();
    let mediaUrls = [];

    try {
        const service = await db.Service.findByPk(id, {
            include: [{ model: db.Media, as: "media" }],
            transaction: t,
        });

        if (!service) throw new Error("Service not found");

        mediaUrls = (service.media || []).map((m) => m.url).filter(Boolean);

        await MediaService.deleteMediaByEntity("service", id, t);
        await service.destroy({ transaction: t });

        await t.commit();

        for (const url of mediaUrls) {
            await safeUnlinkByUrl(url);
        }

        return { errCode: 0, errMessage: "Service hard deleted successfully" };
    } catch (error) {
        await t.rollback();
        console.error("❌ Error in hardDeleteService:", error);
        return { errCode: 1, errMessage: "Failed to hard delete service" };
    }
};

export default {
    createService,
    getAllServices,
    getServiceById,
    getServiceBySlug,
    updateService,
    softDeleteService,
    restoreService,
    hardDeleteService,
    getServicesByCategory,
};
