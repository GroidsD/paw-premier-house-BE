const detectIntent = require("./intentDetector");
const buildContext = require("./contextBuilder");
const buildMessages = require("./promptBuilder");
const llmService = require("./llmService");
const analyzeMessage = require("./productQueryAnalyzer");
const formatResponse = require("./formatters/chatResponseFormatter");

const shouldUseLLMReply = ({ context }) => {
    const answerMode = context?.answer_mode || "general_fallback";
    const failureReason = context?.failure_reason || null;

    const hasKnowledgeItems =
        Array.isArray(context?.knowledge_items) &&
        context.knowledge_items.length > 0;

    const hasExternalSources =
        Array.isArray(context?.external_sources) &&
        context.external_sources.length > 0;

    if (
        failureReason === "ambiguous_reference_no_context" ||
        failureReason === "needs_clarification" ||
        failureReason === "product_not_resolved_for_internal_knowledge" ||
        failureReason === "service_not_resolved_for_internal_knowledge" ||
        failureReason === "auth_required"
    ) {
        return false;
    }

    if (answerMode === "db_strict") {
        return false;
    }

    if (answerMode === "internal_knowledge") {
        return hasKnowledgeItems;
    }

    if (answerMode === "external_reference") {
        return hasExternalSources;
    }

    if (answerMode === "general_fallback") {
        return false;
    }

    return false;
};

const normalizeUserContext = (currentUser = {}) => ({
    ...(currentUser || {}),
    user_id: currentUser?.user_id || null,
    currentProductId:
        currentUser?.currentProductId || currentUser?.lastProductId || null,
    currentProductName:
        currentUser?.currentProductName || currentUser?.lastProductName || null,
    currentServiceId:
        currentUser?.currentServiceId || currentUser?.lastServiceId || null,
    currentServiceName:
        currentUser?.currentServiceName || currentUser?.lastServiceName || null,
    lastProductId: currentUser?.lastProductId || null,
    lastProductName: currentUser?.lastProductName || null,
    lastServiceId: currentUser?.lastServiceId || null,
    lastServiceName: currentUser?.lastServiceName || null,
});

const buildResolvedContext = ({ context, formatted, normalizedUser }) => {
    const firstItem = Array.isArray(context?.items) ? context.items[0] : null;
    const contextType = context?.type || "general";

    let resolved = {
        lastProductId: normalizedUser?.lastProductId || null,
        lastProductName: normalizedUser?.lastProductName || null,
        lastServiceId: normalizedUser?.lastServiceId || null,
        lastServiceName: normalizedUser?.lastServiceName || null,
    };

    if (contextType === "products" || contextType === "knowledge") {
        const productId =
            firstItem?.product_id ||
            normalizedUser?.currentProductId ||
            normalizedUser?.lastProductId ||
            null;

        const productName =
            firstItem?.name ||
            normalizedUser?.currentProductName ||
            normalizedUser?.lastProductName ||
            null;

        if (productId || productName) {
            resolved = {
                ...resolved,
                lastProductId: productId,
                lastProductName: productName,
            };
        }
    }

    if (contextType === "services") {
        const serviceId =
            firstItem?.service_id ||
            normalizedUser?.currentServiceId ||
            normalizedUser?.lastServiceId ||
            null;

        const serviceName =
            firstItem?.name ||
            normalizedUser?.currentServiceName ||
            normalizedUser?.lastServiceName ||
            null;

        if (serviceId || serviceName) {
            resolved = {
                ...resolved,
                lastServiceId: serviceId,
                lastServiceName: serviceName,
            };
        }
    }

    if (formatted?.meta?.failure_reason === "ambiguous_reference_no_context") {
        return resolved;
    }

    return resolved;
};

const handleChat = async ({ message, currentUser }) => {
    const startedAt = Date.now();
    const normalizedUser = normalizeUserContext(currentUser);

    const t1 = Date.now();
    const analysis = await analyzeMessage(message);
    const analysisTime = Date.now() - t1;

    const t2 = Date.now();
    const intent = detectIntent({
        message,
        analysis,
        currentUser: normalizedUser,
    });
    const intentTime = Date.now() - t2;

    const t3 = Date.now();
    const context = await buildContext({
        intent,
        message,
        currentUser: normalizedUser,
        analysis,
    });
    const contextTime = Date.now() - t3;

    let rawReply = context?.reply || "";
    let llmTime = 0;
    console.log("shouldUseLLMReply:", shouldUseLLMReply({ context }));
    if (shouldUseLLMReply({ context })) {
        const t4 = Date.now();

        rawReply = await llmService.generateReply(
            buildMessages({
                mode: context?.answer_mode,
                intent,
                message,
                currentUser: normalizedUser,
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
        currentUser: normalizedUser,
    });

    const resolvedContext = buildResolvedContext({
        context,
        formatted,
        normalizedUser,
    });

    const response = {
        ...formatted,
        meta: {
            ...(formatted?.meta || {}),
            resolved_context: resolvedContext,
        },
    };

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
        failureReason: context?.failure_reason,
        hasKnowledgeItems:
            Array.isArray(context?.knowledge_items) &&
            context.knowledge_items.length > 0,
        hasExternalSources:
            Array.isArray(context?.external_sources) &&
            context.external_sources.length > 0,
        resolvedContext,
    });

    return response;
};

module.exports = {
    handleChat,
};
