import chatService from "../services/AI/chatService";

const chat = async (req, res) => {
    try {
        const { message, currentUser: clientContext = {} } = req.body;
        const authUser = req.user || null;

        const currentUser = {
            ...(authUser || {}),
            currentProductId: clientContext?.currentProductId || null,
            currentProductName: clientContext?.currentProductName || null,
            currentServiceId: clientContext?.currentServiceId || null,
            currentServiceName: clientContext?.currentServiceName || null,
            lastProductId: clientContext?.lastProductId || null,
            lastProductName: clientContext?.lastProductName || null,
            lastServiceId: clientContext?.lastServiceId || null,
            lastServiceName: clientContext?.lastServiceName || null,
        };

        console.log("Received chat message:", message);
        console.log("Auth user:", req.user);
        console.log("Client chat context:", clientContext);
        console.log("Merged current user:", currentUser);

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
