"use strict";

const USER_SEED_DATA = [
    {
        user_id: "1r5vRBf0xMfeDWu4TIKSMfhEJD43",
        role_id: 3,
    },
    {
        user_id: "hARAG6MCfAbDPHRISaCXx2IM0sa2",
        role_id: 2,
    },
    {
        user_id: "VnWvx8YUM2Z4WbMJYgaDqbw64cQ2",
        role_id: 1,
    },
    {
        user_id: "YouTcECtDDhN6jk5a9vGIWJ4K8m1",
        role_id: 4,
    },
];

module.exports = {
    async up(queryInterface) {
        const now = new Date();

        const [users] = await queryInterface.sequelize.query(
            `SELECT user_id, user_id FROM users;`,
        );

        const userMap = {};
        users.forEach((u) => {
            userMap[u.user_id] = u.user_id;
        });

        const rows = USER_SEED_DATA.map((item) => ({
            user_id: userMap[item.user_id],
            role_id: item.role_id,
            created_at: now,
            updated_at: now,
        })).filter((row) => row.user_id);

        if (rows.length) {
            await queryInterface.bulkInsert("user_roles", rows, {});
        }
    },

    async down(queryInterface) {
        const [users] = await queryInterface.sequelize.query(
            `SELECT user_id, user_id FROM users WHERE user_id IN (
        '1r5vRBf0xMfeDWu4TIKSMfhEJD43',
        'hARAG6MCfAbDPHRISaCXx2IM0sa2',
        'VnWvx8YUM2Z4WbMJYgaDqbw64cQ2',
        'YouTcECtDDhN6jk5a9vGIWJ4K8m1'
      );`,
        );

        const userIds = users.map((u) => u.user_id);

        if (!userIds.length) return;

        await queryInterface.bulkDelete(
            "user_roles",
            {
                user_id: userIds,
            },
            {},
        );
    },
};
