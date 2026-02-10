import db from "../models/index.js";

let createCategory = async (data) => {
    const { type, isActive = true } = data;

    const category = await db.ProductCategory.create({
        type,
        isActive,
    });

    return category;
};

let getAllCategories = async () => {
    return await db.ProductCategory.findAll({
        where: { isDelete: false },
        order: [["productCategories_id", "ASC"]],
    });
};

let getCategoryById = async (productCategories_id) => {
    return await db.ProductCategory.findByPk(productCategories_id);
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
        type: data.type ?? category.type,
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
