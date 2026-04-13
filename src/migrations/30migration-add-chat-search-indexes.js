"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex(
            "products",
            ["isActive", "isDelete", "productCategories_id", "updated_at"],
            {
                name: "idx_products_chat_search",
            },
        );

        await queryInterface.addIndex(
            "productCategories",
            ["isActive", "isDelete", "type"],
            {
                name: "idx_productCategories_active_type",
            },
        );

        await queryInterface.addIndex(
            "productVariants",
            ["product_id", "isActive"],
            {
                name: "idx_productVariants_product_active",
            },
        );

        await queryInterface.addIndex(
            "media",
            ["entity_type", "entity_id", "is_main"],
            {
                name: "idx_media_entity_main",
            },
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex(
            "products",
            "idx_products_chat_search",
        );

        await queryInterface.removeIndex(
            "productCategories",
            "idx_productCategories_active_type",
        );

        await queryInterface.removeIndex(
            "productVariants",
            "idx_productVariants_product_active",
        );

        await queryInterface.removeIndex("media", "idx_media_entity_main");
    },
};
