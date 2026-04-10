const detectIntent = require("./intentDetector");
const buildContext = require("./contextBuilder");
const buildPrompt = require("./promptBuilder");
const llmService = require("./llmService");
const analyzeMessage = require("./productQueryAnalyzer");
const formatResponse = require("./formatters/chatResponseFormatter");

const handleChat = async ({ message, currentUser }) => {
    const analysis = await analyzeMessage(message);
    const intent = detectIntent({
        message,
        analysis,
    });

    const context = await buildContext({
        intent,
        message,
        currentUser,
        analysis,
    });

    const prompt = buildPrompt({
        intent,
        message,
        currentUser,
        context,
        analysis,
    });

    const rawReply = await llmService.generateReply(prompt, {
        language: analysis.language,
    });

    return formatResponse({
        intent,
        rawReply,
        context,
        analysis,
    });
};

export default {
    handleChat,
};
