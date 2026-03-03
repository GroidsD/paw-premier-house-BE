import db from "../models/index.js";
import MediaService from "./MediaService.js";
import { safeUnlinkByUrl } from "../helper/safeUnlinkByUrl.js";

const createService = async (data) => {
    const t = await db.sequelize.transaction();
    try {
        const service = await db.Service.create(
            {
                serviceCategories_id: data.serviceCategories_id || null,
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration,
            },
            { transaction: t },
        );

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
            include: [{ model: db.Media, as: "media" }],
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

const getAllServices = async () => {
    try {
        const services = await db.Service.findAll({
            where: {
                isDeleted: false,
                isActive: true,
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
            ],
            order: [["created_at", "DESC"]],
        });

        return {
            errCode: 0,
            services,
        };
    } catch (error) {
        console.error("❌ Error in getAllServices:", error);
        return {
            errCode: 1,
            errMessage: "Failed to fetch services",
        };
    }
};

const getServiceById = async (id) => {
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
            ],
        });

        if (!service) {
            return {
                errCode: 1,
                errMessage: "Service not found",
                service: null,
            };
        }

        return {
            errCode: 0,
            service,
        };
    } catch (error) {
        console.error("❌ Error in getServiceById:", error);
        return {
            errCode: 1,
            errMessage: "Failed to fetch service",
        };
    }
};

const getServicesByCategory = async (category_id) => {
    try {
        const services = await db.Service.findAll({
            where: {
                serviceCategories_id: category_id,
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
            ],
            order: [["created_at", "DESC"]],
        });

        return {
            errCode: 0,
            services,
        };
    } catch (error) {
        console.error("❌ Error in getServicesByCategory:", error);
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

// const updateService = async (id, data) => {
//     const t = await db.sequelize.transaction();
//     try {
//         const service = await db.Service.findByPk(id);
//         if (!service || service.isDeleted) {
//             return { errCode: 1, errMessage: "Service not found" };
//         }

//         await service.update(
//             {
//                 name: data.name ?? service.name,
//                 description: data.description ?? service.description,
//                 price: data.price ?? service.price,
//                 duration: data.duration ?? service.duration,
//                 serviceCategories_id:
//                     data.serviceCategories_id ?? service.serviceCategories_id,
//                 isActive:
//                     data.isActive !== undefined
//                         ? data.isActive
//                         : service.isActive,
//             },
//             { transaction: t },
//         );

//         if (Array.isArray(data.media)) {
//             await MediaService.updateMediaForEntity(
//                 data.media,
//                 id,
//                 "service",
//                 t,
//             );
//         }

//         await t.commit();

//         const updated = await db.Service.findByPk(id, {
//             include: [{ model: db.Media, as: "media" }],
//         });

//         return {
//             errCode: 0,
//             errMessage: "Service updated successfully",
//             service: updated,
//         };
//     } catch (error) {
//         await t.rollback();
//         console.error("❌ Error in updateService:", error);
//         return {
//             errCode: 1,
//             errMessage: error.message,
//         };
//     }
// };
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
            // nếu request có upload file mới nhưng service không tồn tại => xóa file mới (tránh rác)
            if (Array.isArray(data.media) && data.media[0]?.url) {
                await safeUnlinkByUrl(data.media[0].url);
            }
            return { errCode: 1, errMessage: "Service not found" };
        }

        // ✅ lưu lại media cũ để lát xóa file
        oldMedia = (service.media || []).map((m) => m.url).filter(Boolean);

        await service.update(
            {
                name: data.name ?? service.name,
                description: data.description ?? service.description,
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

        // ✅ nếu có media mới => update DB media
        if (Array.isArray(data.media) && data.media.length > 0) {
            newUploadedMedia = data.media.map((m) => m.url).filter(Boolean);
            await MediaService.updateMediaForEntity(
                data.media,
                id,
                "service",
                t,
            );
        }

        await t.commit();

        // ✅ commit xong mới xóa file cũ (chỉ khi có upload ảnh mới)
        if (newUploadedMedia.length > 0 && oldMedia.length > 0) {
            for (const url of oldMedia) {
                // nếu url cũ trùng url mới (hiếm) thì khỏi xóa
                if (!newUploadedMedia.includes(url)) await safeUnlinkByUrl(url);
            }
        }

        const updated = await db.Service.findByPk(id, {
            include: [{ model: db.Media, as: "media" }],
        });

        return {
            errCode: 0,
            errMessage: "Service updated successfully",
            service: updated,
        };
    } catch (error) {
        await t.rollback();

        // ✅ update fail mà có upload file mới => xóa file mới (tránh rác)
        if (Array.isArray(data.media) && data.media[0]?.url) {
            await safeUnlinkByUrl(data.media[0].url);
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

// const hardDeleteService = async (id) => {
//     const t = await db.sequelize.transaction();
//     try {
//         const service = await db.Service.findByPk(id, { transaction: t });
//         if (!service) {
//             throw new Error("Service not found");
//         }

//         await MediaService.deleteMediaByEntity("service", id, t);

//         await service.destroy({ transaction: t });

//         await t.commit();

//         return {
//             errCode: 0,
//             errMessage: "Service hard deleted successfully",
//         };
//     } catch (error) {
//         await t.rollback();
//         console.error("❌ Error in hardDeleteService:", error);
//         return {
//             errCode: 1,
//             errMessage: "Failed to hard delete service",
//         };
//     }
// };
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
    updateService,
    softDeleteService,
    hardDeleteService,
    getServicesByCategory,
};
