const detectIntent = require("./intentDetector");
const buildContext = require("./contextBuilder");
const buildPrompt = require("./promptBuilder");
const llmService = require("./llmService");
const analyzeMessage = require("./productQueryAnalyzer");
const formatResponse = require("./formatters/chatResponseFormatter");

const shouldUseLLMReply = ({ intent, context }) => {
    const answerMode = context?.answer_mode || "general_fallback";
    const contextType = context?.type || "general";
    const hasItems = Array.isArray(context?.items) && context.items.length > 0;
    const confidence = context?.confidence ?? 0;
    const hasReply = Boolean(String(context?.reply || "").trim());

    const hasKnowledgeItems =
        Array.isArray(context?.knowledge_items) &&
        context.knowledge_items.length > 0;

    const hasExternalSources =
        Array.isArray(context?.external_sources) &&
        context.external_sources.length > 0;

    if (answerMode === "internal_knowledge") {
        return hasKnowledgeItems;
    }

    if (answerMode === "external_reference") {
        return hasExternalSources;
    }

    if (contextType === "general") {
        return true;
    }

    if (intent === "general_support") {
        return true;
    }

    if (answerMode === "db_strict") {
        if (
            !hasItems &&
            contextType !== "auth_required" &&
            confidence < 0.35 &&
            !hasReply
        ) {
            return true;
        }

        return false;
    }

    return false;
};

const handleChat = async ({ message, currentUser, history = [] }) => {
    const startedAt = Date.now();

    const t1 = Date.now();
    const analysis = await analyzeMessage(message, history);
    const analysisTime = Date.now() - t1;

    const t2 = Date.now();
    const intent = detectIntent({ message, analysis, currentUser, history });
    const intentTime = Date.now() - t2;

    const t3 = Date.now();
    const context = await buildContext({
        intent,
        message,
        currentUser,
        analysis,
        history,
    });
    const contextTime = Date.now() - t3;

    let rawReply = context?.reply || "";
    let llmTime = 0;

    if (shouldUseLLMReply({ intent, context })) {
        const t4 = Date.now();

        rawReply = await llmService.generateReply(
            buildPrompt({
                mode: context?.answer_mode,
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

    formatted.meta = Object.assign({}, formatted.meta, {
        petType: analysis.petType,
        petSize: analysis.petSize,
        discount_mode: analysis.discountMode,
        product_form: analysis.productForm,
        confidence: context?.confidence,
        context_type: context?.type,
        intent,
        history_length: history.length,
    });

    console.log("chat timing:", {
        total: Date.now() - startedAt,
        analysisTime,
        intentTime,
        contextTime,
        llmTime,
        intent,
        contextType: context?.type,
        answerMode: context?.answer_mode,
        confidence: context?.confidence,
        hasKnowledgeItems:
            Array.isArray(context?.knowledge_items) &&
            context.knowledge_items.length > 0,
        hasExternalSources:
            Array.isArray(context?.external_sources) &&
            context.external_sources.length > 0,
    });

    return formatted;
};

module.exports = {
    handleChat,
};
