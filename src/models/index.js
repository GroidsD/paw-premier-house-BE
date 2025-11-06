"use strict";
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

/**
 * Hàm đệ quy để load tất cả model trong thư mục models và các subfolder
 */
function loadModelsRecursively(directory) {
    fs.readdirSync(directory).forEach((file) => {
        const fullPath = path.join(directory, file);

        if (fs.lstatSync(fullPath).isDirectory()) {
            // Nếu là thư mục -> đệ quy tiếp
            loadModelsRecursively(fullPath);
        } else if (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js" &&
            !file.includes(".test.js")
        ) {
            const model = require(fullPath)(sequelize, Sequelize.DataTypes);
            db[model.name] = model;
        }
    });
}

// Gọi hàm để load tất cả model
loadModelsRecursively(__dirname);

// Thiết lập quan hệ giữa các model
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
