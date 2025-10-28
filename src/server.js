import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import { connectDB } from "./config/connectDB";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import spaRoutes from "./routes/spaRoutes";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import shiftRoutes from "./routes/shiftRoute.js";
import shiftRequestRoutes from "./routes/shiftRequestRoutes.js";
import chatRoute from "./routes/chat.js";

require("dotenv").config();
const multer = require("multer");
const path = require("path");

let app = express();

//  Create HTTP Server from Express
const server = http.createServer(app);

// Cấu hình CORS
const corsOptions = {
    origin: [
        process.env.URL_REACT,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://pet-sanctuary-7f78f.web.app",
    ],
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

// Sau app.use(cors(corsOptions));
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
            "Content-Type, Authorization, X-Requested-With"
        );
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );
    }

    next();
});
app.options("*", cors(corsOptions));

console.log("CORS allowed origins:", corsOptions.origin);

// Multer static route
// app.use(
//   "/uploadsPDF",
//   express.static(path.join(__dirname, "public/uploadsPDF"))
// );
// app.use(
//   "/uploadsExcel",
//   express.static(path.join(__dirname, "public/uploadsExcel"))
// );

app.use(
    "/uploadImageUsers",
    express.static(path.join(__dirname, "public/uploadImageUsers"))
);
app.use(
    "/uploadImageProducts",
    express.static(path.join(__dirname, "public/uploadImageProducts"))
);
// Token Cookie
app.use(cookieParser());
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// Parse request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use("/", chatRoutes);
// app.use("/", searchRoutes);

//Test route
app.use("/", chatRoute);
// app.use("/", testRoute);

app.use(
    express.static(path.join(__dirname, "build"), {
        extensions: ["html"],
        setHeaders: (res, path) => {
            if (path.endsWith(".map")) {
                res.status(403).end();
            }
        },
    })
);

// View engine & routes
viewEngine(app);
initWebRoutes(app);
app.use("/", productRoutes);
app.use("/", orderRoutes);
app.use("/", spaRoutes);
app.use("/", scheduleRoutes);
app.use("/", shiftRoutes);
app.use("/", shiftRequestRoutes);
// Connect DB
connectDB();

// Start server
let port = process.env.PORT || 5059;
server.listen(port, () => {
    console.log("Backend Nodejs is running on port: " + port);
});
