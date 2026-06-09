import db from "../models/index.js";

const createServiceCategory = async (data) => {
    try {
        const category = await db.ServiceCategory.create({
            type: data.type,
            isActive: data.isActive ?? true,
        });

        return category;
    } catch (error) {
        console.error("❌ Error in createServiceCategory:", error);
        throw error;
    }
};

const getAllServiceCategories = async () => {
    try {
        const categories = await db.ServiceCategory.findAll({
            where: {
                isDeleted: false,
            },
            include: [
                {
                    model: db.Service,
                    as: "services",
                },
            ],
        });

        return categories;
    } catch (error) {
        console.error("❌ Error in getAllServiceCategories:", error);
        throw error;
    }
};

const getServiceCategoryById = async (id) => {
    try {
        const category = await db.ServiceCategory.findByPk(id, {
            include: [
                {
                    model: db.Service,
                    as: "services",
                },
            ],
        });

        return category;
    } catch (error) {
        console.error("❌ Error in getServiceCategoryById:", error);
        throw error;
    }
};

const updateServiceCategory = async (id, data) => {
    try {
        const category = await db.ServiceCategory.findByPk(id);
        if (!category) {
            return { errCode: 1, errMessage: "Service category not found" };
        }

        await category.update({
            type: data.type ?? category.type,
            isActive: data.isActive ?? category.isActive,
        });

        return {
            errCode: 0,
            errMessage: "Service category updated successfully",
            category,
        };
    } catch (error) {
        console.error("❌ Error in updateServiceCategory:", error);
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const softDeleteServiceCategory = async (id) => {
    const category = await db.ServiceCategory.findByPk(id);
    if (!category) throw new Error("Service category not found");

    await category.update({
        isActive: false,
        isDeleted: true,
    });

    return true;
};

const hardDeleteServiceCategory = async (id) => {
    const t = await db.sequelize.transaction();
    try {
        const category = await db.ServiceCategory.findByPk(id, {
            transaction: t,
        });

        if (!category) throw new Error("Service category not found");

        await db.Service.update(
            { serviceCategories_id: null },
            {
                where: { serviceCategories_id: id },
                transaction: t,
            },
        );

        await category.destroy({ transaction: t });
        await t.commit();

        return true;
    } catch (error) {
        await t.rollback();
        console.error("❌ Error in hardDeleteServiceCategory:", error);
        throw error;
    }
};

export default {
    createServiceCategory,
    getAllServiceCategories,
    getServiceCategoryById,
    updateServiceCategory,
    softDeleteServiceCategory,
    hardDeleteServiceCategory,
};
