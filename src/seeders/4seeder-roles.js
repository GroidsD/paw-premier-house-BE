"use strict";

const ROLE_DEFINITIONS = [
    { id: 1, name: "admin" },
    { id: 2, name: "manager" },
    { id: 3, name: "staff" },
    { id: 4, name: "customer" },
];

module.exports = {
    async up(queryInterface) {
        const now = new Date();

        const rows = ROLE_DEFINITIONS.map((role) => ({
            ...role,
        }));

        await queryInterface.bulkInsert("roles", rows, {});

        // Chỉ dùng nếu bạn đang xài MySQL/MariaDB
        await queryInterface.sequelize.query(
            "ALTER TABLE roles AUTO_INCREMENT = 5;",
        );
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete(
            "roles",
            {
                name: ROLE_DEFINITIONS.map((r) => r.name),
            },
            {},
        );
    },
};
