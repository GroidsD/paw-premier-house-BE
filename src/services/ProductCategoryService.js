import db from "../models/index.js";

// CREATE
let createCategory = async (data) => {
    const { type, isActive = true } = data;

    const category = await db.ProductCategory.create({
        type,
        isActive,
    });

    return category;
};

// READ ALL
let getAllCategories = async () => {
    return await db.ProductCategory.findAll({
        where: { isDelete: false },
        order: [["productCategories_id", "ASC"]],
    });
};

// READ ONE
let getCategoryById = async (category_id) => {
    return await db.ProductCategory.findByPk(category_id);
};

// UPDATE
let updateCategory = async (category_id, data) => {
    const category = await db.ProductCategory.findByPk(category_id);
    if (!category) {
        return {
            errCode: 1,
            errMessage: "Category not found",
        };
    }

    await category.update({
        type: data.type ?? category.type,
        isActive: data.isActive ?? category.isActive,
    });

    return {
        errCode: 0,
        errMessage: "Category updated successfully",
        category,
    };
};

// SOFT DELETE
let softDeleteCategory = async (category_id) => {
    const category = await db.ProductCategory.findByPk(category_id);
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

// HARD DELETE
let hardDeleteCategory = async (category_id) => {
    const category = await db.ProductCategory.findByPk(category_id);
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
