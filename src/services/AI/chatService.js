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
        currentUser,
    });

    const context = await buildContext({
        intent,
        message,
        currentUser,
        analysis,
    });

    const useLLM =
        context?.type !== "auth_required" &&
        !(
            context?.type === "orders" &&
            (!context?.items || context.items.length === 0) &&
            context?.reply
        );

    let rawReply = context?.reply || "";

    if (useLLM) {
        rawReply = await llmService.generateReply(
            buildPrompt({
                intent,
                message,
                currentUser,
                context,
                analysis,
            }),
            {
                language: analysis.language,
            },
        );
    }

    return formatResponse({
        intent,
        rawReply,
        context,
        analysis,
        currentUser,
    });
};

export default {
    handleChat,
};
