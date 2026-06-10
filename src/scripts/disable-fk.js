require("dotenv").config();

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: false,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
        connectTimeout: 20000,
    },
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log("✔ Connected to Railway DB");

        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
        console.log("✔ FK disabled");
    } catch (err) {
        console.error("❌ DB ERROR:", err);
    } finally {
        await sequelize.close();
    }
})();
