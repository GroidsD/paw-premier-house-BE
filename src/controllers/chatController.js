import chatService from "../services/AI/chatService";

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        const currentUser = req.user;

        console.log("Received chat message:", message);
        console.log("Current user:", req.user);

        if (!message || !String(message).trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const data = await chatService.handleChat({
            message: String(message).trim(),
            currentUser,
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("chatController.chat error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process chat request",
        });
    }
};

export default {
    chat,
};
