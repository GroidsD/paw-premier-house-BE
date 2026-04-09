const detectIntent = require("./intentDetector");
const buildContext = require("./contextBuilder");
const buildPrompt = require("./promptBuilder");
const llmService = require("./llmService");
const formatResponse = require("./formatters/chatResponseFormatter");

const handleChat = async ({ message, currentUser }) => {
    const intent = detectIntent(message);

    const context = await buildContext({
        intent,
        message,
        currentUser,
    });

    const prompt = buildPrompt({
        intent,
        message,
        currentUser,
        context,
    });

    const rawReply = await llmService.generateReply(prompt);

    return formatResponse({
        intent,
        rawReply,
        context,
    });
};

export default {
    handleChat,
};
