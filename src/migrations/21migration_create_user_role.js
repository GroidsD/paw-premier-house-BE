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
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal(
                    "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                ),
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("user_roles");
    },
};
