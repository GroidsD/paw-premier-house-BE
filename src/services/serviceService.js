import db from "../models/index.js";
import MediaService from "./MediaService.js";

// ============================
// CREATE SERVICE
// ============================
const createService = async (data) => {
    const t = await db.sequelize.transaction();
    try {
        // 1️⃣ Tạo service chính
        const service = await db.Service.create(
            {
                serviceCategories_id: data.serviceCategories_id || null,
                price: data.price,
                duration: data.duration,
            },
            { transaction: t }
        );

        // 2️⃣ Tạo translate (nếu có)
        if (Array.isArray(data.translates) && data.translates.length > 0) {
            const translateData = data.translates.map((t) => ({
                service_id: service.service_id,
                language: t.language,
                name: t.name,
                description: t.description,
            }));

            await db.ServiceTranslate.bulkCreate(translateData, {
                transaction: t,
            });
        }

        // 3️⃣ Tạo media (nếu có)
        if (Array.isArray(data.media) && data.media.length > 0) {
            await MediaService.createMediaForEntity(
                data.media,
                service.service_id,
                "service",
                t
            );
        }

        await t.commit();

        // 4️⃣ Trả về service đã tạo kèm include
        const created = await db.Service.findByPk(service.service_id, {
            include: [
                { model: db.ServiceTranslate, as: "translates" },
                { model: db.Media, as: "media" },
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
        return {
            errCode: 1,
            errMessage: error.message || "Failed to create service",
        };
    }
};

// ============================
// GET ALL SERVICES
// ============================
const getAllServices = async () => {
    try {
        const services = await db.Service.findAll({
            include: [
                { model: db.ServiceTranslate, as: "translates" },
                { model: db.Media, as: "media" },
            ],
        });

        return {
            errCode: 0,
            errMessage: "Fetched all services successfully",
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
        const service = await db.Service.findByPk(id, {
            include: [
                { model: db.ServiceTranslate, as: "translates" },
                { model: db.Media, as: "media" },
            ],
        });

        if (!service) {
            return {
                errCode: 1,
                errMessage: "Service not found",
                service: null,
            };
        }

        return { errCode: 0, errMessage: "Fetched service", service };
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
        if (!service) {
            return { errCode: 1, errMessage: "Service not found" };
        }

        // 1️⃣ Cập nhật thông tin chính
        await service.update(
            {
                price: data.price ?? service.price,
                duration: data.duration ?? service.duration,
                serviceCategories_id:
                    data.serviceCategories_id ?? service.serviceCategories_id,
            },
            { transaction: t }
        );

        // 2️⃣ Cập nhật translate
        if (Array.isArray(data.translates)) {
            for (const tData of data.translates) {
                await db.ServiceTranslate.upsert(
                    {
                        service_id: id,
                        language: tData.language,
                        name: tData.name,
                        description: tData.description,
                    },
                    { transaction: t }
                );
            }
        }

        // 3️⃣ Cập nhật media (tự động thêm/sửa/xóa)
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
            include: [
                { model: db.ServiceTranslate, as: "translates" },
                { model: db.Media, as: "media" },
            ],
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
            errMessage: "Failed to update service",
        };
    }
};

// ============================
// 🟢 Soft delete service
// ============================
const softDeleteService = async (id) => {
    const service = await db.Service.findByPk(id);
    if (!service) throw new Error("Service not found");

    await service.update({ isActive: false, isDeleted: true });
    return "Service soft deleted successfully";
};

// ============================
// 🔴 Hard delete service
// ============================
const hardDeleteService = async (id) => {
    const t = await db.sequelize.transaction();
    try {
        const service = await db.Service.findByPk(id, { transaction: t });
        if (!service) throw new Error("Service not found");

        // 1️⃣ Xóa translate liên quan
        await db.ServiceTranslate.destroy({
            where: { service_id: id },
            transaction: t,
        });

        // 2️⃣ Xóa media liên quan
        await MediaService.deleteMediaByEntity("service", id, t);

        // 3️⃣ Xóa service chính
        await service.destroy({ transaction: t });

        await t.commit();
        return "Service hard deleted successfully";
    } catch (error) {
        await t.rollback();
        console.error("❌ Error in hardDeleteService:", error);
        throw new Error("Failed to hard delete service");
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
