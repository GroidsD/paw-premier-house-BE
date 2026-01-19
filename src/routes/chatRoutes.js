// src/routes/chatRoutes.js
import express from "express";
import { handleUserQuery } from "../AI/handleUserQuery.js";

const router = express.Router();

// Endpoint chính để nhận tin nhắn từ frontend
router.post("/api/chatCompletion", async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Missing message" });
        }

        // 🧠 Gọi bộ xử lý trung tâm
        const reply = await handleUserQuery({ text: message, userId });

        return res.json({ success: true, reply });
    } catch (error) {
        console.error("❌ Chat route error:", error);
        res.status(500).json({ error: "Lỗi khi xử lý chat" });
    }
});

export default router;
