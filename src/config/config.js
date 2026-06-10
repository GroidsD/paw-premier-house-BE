require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "database_dev",
        host: process.env.DB_HOST || "127.0.0.1",
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false,
        timezone: "+07:00",
    },
    test: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        timezone: "+07:00",
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        timezone: "+07:00",
    },
};
