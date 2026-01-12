module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_roles", {
            user_id: {
                type: Sequelize.STRING,
                primaryKey: true,
            },
            role_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("user_roles");
    },
};
