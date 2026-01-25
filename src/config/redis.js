// // config/redis.js
// const { createClient } = require("redis");

// const redisClient = createClient({
//     url: process.env.REDIS_URL || "redis://localhost:6379",
// });

// redisClient.on("error", (err) => console.error("Redis Error:", err));
// redisClient.on("connect", () => console.log("Redis connecting..."));
// redisClient.on("ready", () => console.log("Redis is ready"));

// const initRedis = async () => {
//     if (!redisClient.isOpen) {
//         await redisClient.connect();
//     }
//     return redisClient;
// };

// module.exports = { redisClient, initRedis };
