import express from "express";

import chatController from "../controllers/chatController.js";
import optionalAuth from "../middleware/optionalAuthMiddleware.js";

const router = express.Router();
/**
 * Nếu bạn có auth middleware thì gắn vào đây.
 * Nhưng vì chatbot cho cả guest dùng, nên KHÔNG bắt buộc login.
 *
 * Ví dụ:
 * router.post("/", optionalAuth, chatWithBot);
 *
 * Hiện tại làm basic:
 */
router.post("/api/chat", optionalAuth, chatController.chatWithBot);

export default router;
