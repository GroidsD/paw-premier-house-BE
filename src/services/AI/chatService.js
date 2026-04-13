const detectIntent = require("./intentDetector");
const buildContext = require("./contextBuilder");
const buildPrompt = require("./promptBuilder");
const llmService = require("./llmService");
const analyzeMessage = require("./productQueryAnalyzer");
const formatResponse = require("./formatters/chatResponseFormatter");

const handleChat = async ({ message, currentUser }) => {
    const startedAt = Date.now();

    const t1 = Date.now();
    const analysis = await analyzeMessage(message);
    const analysisTime = Date.now() - t1;

    const t2 = Date.now();
    const intent = detectIntent({ message, analysis, currentUser });
    const intentTime = Date.now() - t2;

    const t3 = Date.now();
    const context = await buildContext({
        intent,
        message,
        currentUser,
        analysis,
    });
    const contextTime = Date.now() - t3;

    let rawReply = context?.reply || "";
    let llmTime = 0;

    const shouldUseLLMReply =
        intent === "general_support" ||
        (context?.type === "general" &&
            (!context?.items ||
                context.items.length === 0 ||
                (context?.confidence ?? 0) < 0.35));

    if (shouldUseLLMReply) {
        const t4 = Date.now();
        rawReply = await llmService.generateReply(
            buildPrompt({
                intent,
                message,
                currentUser,
                context,
                analysis,
            }),
            { language: analysis.language },
        );
        llmTime = Date.now() - t4;
    }

    const formatted = formatResponse({
        intent,
        rawReply,
        context,
        analysis,
        currentUser,
    });

    console.log("chat timing:", {
        total: Date.now() - startedAt,
        analysisTime,
        intentTime,
        contextTime,
        llmTime,
        intent,
        contextType: context?.type,
        confidence: context?.confidence,
    });

    return formatted;
};

module.exports = {
    handleChat,
};
