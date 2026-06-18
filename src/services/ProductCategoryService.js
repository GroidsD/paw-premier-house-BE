import db from "../models/index.js";

let createCategory = async (data) => {
    const { type_vi, type_en, isActive = true } = data;

    const category = await db.ProductCategory.create({
        type_vi,
        type_en,
        isActive,
    });

    return category;
};

let getAllCategories = async (lang = "vi") => {
    const categories = await db.ProductCategory.findAll({
        where: { isDelete: false },
        order: [["productCategories_id", "ASC"]],
    });

    // Map response fields based on language
    const mappedCategories = categories.map((category) => {
        const plainCategory = category.get({ plain: true });
        return {
            ...plainCategory,
            type:
                lang === "en"
                    ? plainCategory.type_en || plainCategory.type_vi
                    : plainCategory.type_vi,
            type_vi: plainCategory.type_vi,
            type_en: plainCategory.type_en,
        };
    });

    return mappedCategories;
};

let getCategoryById = async (productCategories_id, lang = "vi") => {
    const category = await db.ProductCategory.findByPk(productCategories_id);

    if (!category) {
        return null;
    }

    // Map response fields based on language
    const plainCategory = category.get({ plain: true });
    const mappedCategory = {
        ...plainCategory,
        type:
            lang === "en"
                ? plainCategory.type_en || plainCategory.type_vi
                : plainCategory.type_vi,
        type_vi: plainCategory.type_vi,
        type_en: plainCategory.type_en,
    };

    return mappedCategory;
};

let updateCategory = async (productCategories_id, data) => {
    const category = await db.ProductCategory.findByPk(productCategories_id);
    if (!category) {
        return {
            errCode: 1,
            errMessage: "Category not found",
        };
    }

    await category.update({
        type_vi: data.type_vi ?? category.type_vi,
        type_en: data.type_en ?? category.type_en,
        isActive: data.isActive ?? category.isActive,
    });

    return {
        errCode: 0,
        errMessage: "Category updated successfully",
        category,
    };
};

let softDeleteCategory = async (productCategories_id) => {
    const category = await db.ProductCategory.findByPk(productCategories_id);
    if (!category) throw "Category not found";

    await category.update({
        isActive: false,
        isDelete: true,
    });

    return {
        errCode: 0,
        errMessage: "Category soft deleted successfully",
    };
};

let hardDeleteCategory = async (productCategories_id) => {
    const category = await db.ProductCategory.findByPk(productCategories_id);
    if (!category) throw "Category not found";
    await category.destroy();
};

export default {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    softDeleteCategory,
    hardDeleteCategory,
};
