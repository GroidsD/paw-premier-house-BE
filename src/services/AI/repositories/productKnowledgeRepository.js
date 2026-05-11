const { ProductKnowledge } = require("../../../models");

const findKnowledgeByProductId = async ({
    productId,
    language = null,
    activeOnly = true,
}) => {
    const baseWhere = {
        product_id: productId,
        ...(activeOnly ? { isActive: true } : {}),
    };

    if (!language) {
        return ProductKnowledge.findAll({
            where: baseWhere,
            order: [
                ["sort_order", "ASC"],
                ["knowledge_id", "ASC"],
            ],
        });
    }

    const preferred = await ProductKnowledge.findAll({
        where: {
            ...baseWhere,
            language,
        },
        order: [
            ["sort_order", "ASC"],
            ["knowledge_id", "ASC"],
        ],
    });

    if (preferred.length > 0) {
        return preferred;
    }

    return ProductKnowledge.findAll({
        where: baseWhere,
        order: [
            ["sort_order", "ASC"],
            ["knowledge_id", "ASC"],
        ],
    });
};

module.exports = {
    findKnowledgeByProductId,
};
