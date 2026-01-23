// // // config/redis.js
// // const { createClient } = require("redis");

// // const redisClient = createClient({
// //     url: process.env.REDIS_URL || "redis://localhost:6379",
// // });

// // redisClient.on("error", (err) => console.error("Redis Error:", err));
// // redisClient.on("connect", () => console.log("Redis connecting..."));
// // redisClient.on("ready", () => console.log("Redis is ready"));

// // const initRedis = async () => {
// //     if (!redisClient.isOpen) {
// //         await redisClient.connect();
// //     }
// //     return redisClient;
// // };

// // module.exports = { redisClient, initRedis };
// // config/redis.js
// const { createClient } = require("redis");

// let redisEnabled = true;

// const redisClient = createClient({
//     url: process.env.REDIS_URL || "redis://127.0.0.1:6379",

//     socket: {
//         // ⏱ timeout cho MỖI lần connect (2s)
//         connectTimeout: 2000,

//         // 🔁 retry strategy (3 lần, mỗi lần cách 2s)
//         reconnectStrategy: (retries) => {
//             if (retries >= 3) {
//                 console.error("Redis retry limit reached (3). Redis disabled.");
//                 redisEnabled = false;
//                 return false; // ❗ stop reconnect hoàn toàn
//             }

//             console.log(`Redis retry attempt ${retries + 1}/3 (wait 2s)`);
//             return 2000; // ⏳ chờ 2s rồi retry
//         },
//     },
// });

// redisClient.on("connect", () => {
//     console.log("Redis connecting...");
// });

// redisClient.on("ready", () => {
//     console.log("Redis is ready");
// });

// redisClient.on("error", (err) => {
//     console.error("Redis Error:", err.message);
// });

// const initRedis = async () => {
//     try {
//         if (!redisClient.isOpen) {
//             await redisClient.connect();
//             console.log("Redis connected successfully");
//         }
//         return redisClient;
//     } catch (err) {
//         console.error("Redis init failed. Redis disabled.");
//         redisEnabled = false;
//         return false;
//     }
// };

// module.exports = {
//     redisClient,
//     initRedis,
//     isRedisEnabled: () => redisEnabled,
// };
