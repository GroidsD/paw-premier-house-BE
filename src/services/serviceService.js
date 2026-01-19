import db from "../models/index.js";
import MediaService from "./MediaService.js";

// ============================
// CREATE SERVICE
// ============================
const createService = async (data) => {
    const t = await db.sequelize.transaction();
    try {
        const service = await db.Service.create(
            {
                serviceCategories_id: data.serviceCategories_id || null,
                name: data.name,
                description: data.description,
                price: data.price,
                duration: data.duration, // ✅ đã có trong model
            },
            { transaction: t }
        );

        if (Array.isArray(data.media) && data.media.length > 0) {
            await MediaService.createMediaForEntity(
                data.media,
                service.service_id,
                "service",
                t
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

// ============================
// GET ALL SERVICES
// ============================
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

// ============================
// GET SERVICE BY ID
// ============================
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

// ============================
// UPDATE SERVICE
// ============================
const updateService = async (id, data) => {
    const t = await db.sequelize.transaction();
    try {
        const service = await db.Service.findByPk(id);
        if (!service || service.isDeleted) {
            return { errCode: 1, errMessage: "Service not found" };
        }

        await service.update(
            {
                name: data.name ?? service.name,
                description: data.description ?? service.description,
                price: data.price ?? service.price,
                duration: data.duration ?? service.duration,
                serviceCategories_id:
                    data.serviceCategories_id ?? service.serviceCategories_id,
            },
            { transaction: t }
        );

        if (Array.isArray(data.media)) {
            await MediaService.updateMediaForEntity(
                data.media,
                id,
                "service",
                t
            );
        }

        await t.commit();

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
        console.error("❌ Error in updateService:", error);
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

// ============================
// 🟢 SOFT DELETE SERVICE
// ============================
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

// ============================
// 🔴 HARD DELETE SERVICE
// ============================
const hardDeleteService = async (id) => {
    const t = await db.sequelize.transaction();
    try {
        const service = await db.Service.findByPk(id, { transaction: t });
        if (!service) {
            throw new Error("Service not found");
        }

        // Xóa media liên quan
        await MediaService.deleteMediaByEntity("service", id, t);

        // Xóa service
        await service.destroy({ transaction: t });

        await t.commit();

        return {
            errCode: 0,
            errMessage: "Service hard deleted successfully",
        };
    } catch (error) {
        await t.rollback();
        console.error("❌ Error in hardDeleteService:", error);
        return {
            errCode: 1,
            errMessage: "Failed to hard delete service",
        };
    }
};

export default {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    softDeleteService,
    hardDeleteService,
};
