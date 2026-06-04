"use strict";

const { generateSlug } = require("../utils/slug");

module.exports = {
    async up(queryInterface) {
        const [services] = await queryInterface.sequelize.query(`
            SELECT service_id, name
            FROM services
            WHERE slug IS NULL OR slug = ''
        `);

        for (const service of services) {
            await queryInterface.sequelize.query(
                `
                UPDATE services
                SET slug = :slug
                WHERE service_id = :service_id
                `,
                {
                    replacements: {
                        slug: generateSlug(service.name),
                        service_id: service.service_id,
                    },
                },
            );
        }
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(`
            UPDATE services
            SET slug = NULL
        `);
    },
};
