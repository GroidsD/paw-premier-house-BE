module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("user_permissions", {
            user_id: { type: Sequelize.STRING, primaryKey: true },
            permission_id: { type: Sequelize.INTEGER, primaryKey: true },
            allowed: { type: Sequelize.BOOLEAN, allowNull: false },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("user_permissions");
    },
};
