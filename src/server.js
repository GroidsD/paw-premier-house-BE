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

require("dotenv").config();
const multer = require("multer");
const path = require("path");

let app = express();

//  Create HTTP Server from Express
const server = http.createServer(app);

// Cấu hình CORS
const corsOptions = {
  origin: process.env.URL_REACT || "http://localhost:3000",
  methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

app.use(cors(corsOptions));

// Multer static route
// app.use(
//   "/uploadsPDF",
//   express.static(path.join(__dirname, "public/uploadsPDF"))
// );
app.use(
  "/uploadsExcel",
  express.static(path.join(__dirname, "public/uploadsExcel"))
);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

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

// Connect DB
connectDB();

// Start server
let port = process.env.PORT || 5059;
server.listen(port, () => {
  console.log("Backend Nodejs is running on port: " + port);
});
