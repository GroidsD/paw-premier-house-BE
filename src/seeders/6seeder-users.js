"use strict";

const USER_SEED_DATA = [
    {
        user_id: "1r5vRBf0xMfeDWu4TIKSMfhEJD43",
        email: "staff@gmail.com",
        fullname: "staff",
        gender: "male",
        avatar: "https://media.istockphoto.com/id/1478688329/ja/%E3%83%99%E3%82%AF%E3%82%BF%E3%83%BC/web-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E3%81%AE%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%99%E3%82%AF%E3%83%88%E3%83%AB.jpg?s=170667a&w=0&k=20&c=1fBF9Q-uASa_otFfPXTVR2-So4X3wc-NLIUhN3wE5_Q=",
        auth_provider: "firebase",
        isActive: 1,
    },
    {
        user_id: "hARAG6MCfAbDPHRISaCXx2IM0sa2",
        email: "manager@gmail.com",
        fullname: "Thiên Sơn",
        gender: "male",
        avatar: "https://media.istockphoto.com/id/1478688329/ja/%E3%83%99%E3%82%AF%E3%82%BF%E3%83%BC/web-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E3%81%AE%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%99%E3%82%AF%E3%83%88%E3%83%AB.jpg?s=170667a&w=0&k=20&c=1fBF9Q-uASa_otFfPXTVR2-So4X3wc-NLIUhN3wE5_Q=",

        auth_provider: "firebase",
        isActive: 1,
    },
    {
        user_id: "VnWvx8YUM2Z4WbMJYgaDqbw64cQ2",
        email: "admin@gmail.com",
        fullname: "Admin",
        gender: "male",
        avatar: "https://media.istockphoto.com/id/1478688329/ja/%E3%83%99%E3%82%AF%E3%82%BF%E3%83%BC/web-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E3%81%AE%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%99%E3%82%AF%E3%83%88%E3%83%AB.jpg?s=170667a&w=0&k=20&c=1fBF9Q-uASa_otFfPXTVR2-So4X3wc-NLIUhN3wE5_Q=",

        auth_provider: "firebase",
        isActive: 1,
    },
    {
        user_id: "YouTcECtDDhN6jk5a9vGIWJ4K8m1",
        email: "duy@gmail.com",
        fullname: "Duy",
        gender: "male",
        avatar: "https://media.istockphoto.com/id/1478688329/ja/%E3%83%99%E3%82%AF%E3%82%BF%E3%83%BC/web-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E3%81%AE%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%99%E3%82%AF%E3%83%88%E3%83%AB.jpg?s=170667a&w=0&k=20&c=1fBF9Q-uASa_otFfPXTVR2-So4X3wc-NLIUhN3wE5_Q=",

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
