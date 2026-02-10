import db from "../models/index.js";

let createMedia = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const media = await db.Media.create(data);
            resolve(media);
        } catch (e) {
            reject(e);
        }
    });
};

let getAllMedia = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const where = {};
            if (filters.entity_type) where.entity_type = filters.entity_type;
            if (filters.entity_id) where.entity_id = filters.entity_id;

            const medias = await db.Media.findAll({
                where,
                order: [["media_id", "ASC"]],
            });
            resolve(medias);
        } catch (e) {
            reject(e);
        }
    });
};

let getMediaById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const media = await db.Media.findByPk(id);
            if (!media) return reject("Media not found");
            resolve(media);
        } catch (e) {
            reject(e);
        }
    });
};

let updateMedia = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const media = await db.Media.findByPk(id);
            if (!media) return reject("Media not found");
            await media.update(data);
            resolve(media);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteMedia = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const media = await db.Media.findByPk(id);
            if (!media) return reject("Media not found");
            await media.destroy();
            resolve("Media deleted successfully");
        } catch (e) {
            reject(e);
        }
    });
};

let createMediaForEntity = (
    mediaList,
    entityId,
    entityType,
    transaction = null,
) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!Array.isArray(mediaList) || mediaList.length === 0)
                return resolve();

            const formatted = mediaList.map((m) => ({
                entity_type: entityType,
                entity_id: String(entityId),
                url: m.url,
                is_main: m.is_main ?? false,
                alt_text: m.alt_text ?? null,
            }));

            await db.Media.bulkCreate(formatted, { transaction });
            resolve("Media created successfully");
        } catch (e) {
            reject(e);
        }
    });
};

let updateMediaForEntity = (
    mediaList,
    entityId,
    entityType,
    transaction = null,
) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!Array.isArray(mediaList)) return resolve();

            const existing = await db.Media.findAll({
                where: { entity_id: entityId, entity_type: entityType },
                transaction,
            });

            const existingMap = new Map();
            existing.forEach((m) => existingMap.set(m.url, m));

            for (const m of mediaList) {
                if (existingMap.has(m.url)) {
                    await db.Media.update(
                        {
                            is_main: m.is_main ?? false,
                            alt_text: m.alt_text ?? null,
                        },
                        {
                            where: {
                                entity_id: entityId,
                                entity_type: entityType,
                                url: m.url,
                            },
                            transaction,
                        },
                    );
                    existingMap.delete(m.url);
                } else {
                    await db.Media.create(
                        {
                            entity_id: entityId,
                            entity_type: entityType,
                            url: m.url,
                            is_main: m.is_main ?? false,
                            alt_text: m.alt_text ?? null,
                        },
                        { transaction },
                    );
                }
            }

            for (const [url] of existingMap.entries()) {
                await db.Media.destroy({
                    where: {
                        entity_id: entityId,
                        entity_type: entityType,
                        url,
                    },
                    transaction,
                });
            }

            resolve("Media updated successfully");
        } catch (e) {
            reject(e);
        }
    });
};

let deleteMediaByEntity = async (entityType, entityId) => {
    try {
        await db.Media.destroy({
            where: { entity_type: entityType, entity_id: entityId },
        });
        return "Media deleted successfully";
    } catch (e) {
        throw e;
    }
};

let getServicesByCategory = async (categoryId) => {
    try {
        let services = await db.Service.findAll({
            where: { serviceCategories_id: categoryId },
            include: [
                { model: db.ServiceTranslate, as: "translates" },
                { model: db.Media, as: "media" },
            ],
        });

        if (!services || services.length === 0) {
            return {
                errCode: 1,
                errMessage: "No services found for this category",
                services: [],
            };
        }

        return {
            errCode: 0,
            errMessage: "Fetched services by category successfully",
            services,
        };
    } catch (error) {
        return {
            errCode: 1,
            errMessage: "Failed to fetch services by category",
        };
    }
};

export default {
    createMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    deleteMedia,
    createMediaForEntity,
    updateMediaForEntity,
    deleteMediaByEntity,
    getServicesByCategory,
};
