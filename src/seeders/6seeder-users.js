"use strict";

const USER_SEED_DATA = [
    {
        user_id: "1r5vRBf0xMfeDWu4TIKSMfhEJD43",
        email: "staff@gmail.com",
        fullname: "staff",
        gender: "male",
        avatar: null,
        auth_provider: "firebase",
        isActive: 1,
    },
    {
        user_id: "hARAG6MCfAbDPHRISaCXx2IM0sa2",
        email: "manager@gmail.com",
        fullname: "Thiên Sơn",
        gender: "male",
        avatar: null,

        auth_provider: "firebase",
        isActive: 1,
    },
    {
        user_id: "VnWvx8YUM2Z4WbMJYgaDqbw64cQ2",
        email: "admin@gmail.com",
        fullname: "Admin",
        gender: "male",
        avatar: "/uploadImageUsers/user-VnWvx8YUM2Z4WbMJYgaDqbw64cQ2-1773129359271.jpg",

        auth_provider: "firebase",
        isActive: 1,
    },
    {
        user_id: "YouTcECtDDhN6jk5a9vGIWJ4K8m1",
        email: "duy@gmail.com",
        fullname: "Duy",
        gender: "male",
        avatar: null,

        auth_provider: "firebase",
        isActive: 1,
    },
];

module.exports = {
    async up(queryInterface) {
        const now = new Date();

        const rows = USER_SEED_DATA.map(({ role_id, ...user }) => ({
            ...user,
            created_at: now,
            updated_at: now,
        }));

        await queryInterface.bulkInsert("users", rows, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete(
            "users",
            {
                user_id: USER_SEED_DATA.map((u) => u.user_id),
            },
            {},
        );
    },
};
