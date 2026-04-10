import express from "express";
import chatController from "../controllers/chatController.js";
import optionalAuth from "../middleware/optionalAuthMiddleware.js";

const router = express.Router();

router.post("/api/chat", optionalAuth, chatController.chat);

export default router;
