module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("role_permissions", {
            role_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            permission_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("role_permissions");
    },
};
