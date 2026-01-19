module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("permissions", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            action: { type: Sequelize.STRING, unique: true, allowNull: false },
            description: Sequelize.STRING,
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("permissions");
    },
};
