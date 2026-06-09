import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/userRoutes";
import { connectDB } from "./config/connectDB";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import productRoutes from "./routes/productRoutes";
import productCategoryRoutes from "./routes/productCategoryRoutes.js";
import orderRoutes from "./routes/orderRoutes";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceCategoryRoutes from "./routes/serviceCategoryRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import voucherRoutes from "./routes/voucherRoutes.js";
import rbacRoutes from "./routes/rbacRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import featuresRoutes from "./routes/featureRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { initRedis } from "./config/redis.js";
const scheduleOrderTimeoutCheck = require("./cron/orderTimeoutJob");
const scheduleBookingTimeoutCheck = require("./cron/bookingTimeoutJob");
const scheduleBookingReminderCheck = require("./cron/bookingReminderJob");

require("dotenv").config();
const multer = require("multer");
const path = require("path");

let app = express();

const server = http.createServer(app);

const corsOptions = {
    origin: [process.env.URL_REACT, "http://localhost:5173"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
};

app.use((req, res, next) => {
    console.log(`[CORS DEBUG] Request Origin: ${req.headers.origin}`);
    console.log(`[CORS DEBUG] URL_REACT (Expected): ${process.env.URL_REACT}`);
    next();
});
app.use(cors(corsOptions));

app.use((req, res, next) => {
    const allowedOrigins = [
        process.env.URL_REACT,
        "http://localhost:3000",
        "https://pet-sanctuary-7f78f.web.app",
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, X-Requested-With",
        );
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE",
        );
    }

    next();
});
app.options("*", cors(corsOptions));

console.log("CORS allowed origins:", corsOptions.origin);

app.use(
    "/uploadImageUsers",
    express.static(path.join(__dirname, "public/uploadImageUsers")),
);
app.use(
    "/uploadImageProducts",
    express.static(path.join(__dirname, "public/uploadImageProducts")),
);
app.use(
    "/uploadMedia",
    express.static(path.join(__dirname, "public/uploadMedia")),
);
app.use(
    "/uploadImageServices",
    express.static(path.join(__dirname, "public/uploadImageServices")),
);
app.use(
    "/uploadImagePets",
    express.static(path.join(__dirname, "public/uploadImagePets")),
);

app.use(cookieParser());
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", chatRoutes);

app.use(
    express.static(path.join(__dirname, "build"), {
        extensions: ["html"],
        setHeaders: (res, path) => {
            if (path.endsWith(".map")) {
                res.status(403).end();
            }
        },
    }),
);

viewEngine(app);
initWebRoutes(app);
app.use("/", productRoutes);
app.use("/", productCategoryRoutes);
app.use("/", orderRoutes);
app.use("/", serviceRoutes);
app.use("/", serviceCategoryRoutes);
app.use("/", scheduleRoutes);
app.use("/", shiftRoutes);
app.use("/", bookingRoutes);
app.use("/", petRoutes);
app.use("/", featuresRoutes);
app.use("/", notificationRoutes);

app.use("/", voucherRoutes);
app.use("/", rbacRoutes);
app.use("/", revenueRoutes);
app.use("/", paymentRoutes);
connectDB();

// Start cron jobs
scheduleOrderTimeoutCheck();
scheduleBookingTimeoutCheck();
scheduleBookingReminderCheck();

let port = process.env.PORT || 5059;
server.listen(port, () => {
    console.log("🔥 REAL DB =", process.env.DB_NAME);
    console.log("Backend Nodejs is running on port: " + port);
});
