const pickResponseLanguage = (analysis = {}) =>
    analysis?.language === "en" ? "English" : "Vietnamese";

const summarizeAnalysis = (analysis = {}) => ({
    language: analysis?.language || null,
    inputLanguage: analysis?.inputLanguage || analysis?.input_language || null,
    petType: analysis?.petType || analysis?.pet_type || null,
    petSize: analysis?.petSize || analysis?.pet_size || null,
    discountMode: analysis?.discountMode || analysis?.discount_mode || null,
    productForm: analysis?.productForm || analysis?.product_form || null,
    searchTerms: Array.isArray(analysis?.searchTerms)
        ? analysis.searchTerms.slice(0, 8)
        : [],
    categoryHints: Array.isArray(analysis?.categoryHints)
        ? analysis.categoryHints.slice(0, 8)
        : [],
});

const takeTop = (list, n) => (Array.isArray(list) ? list.slice(0, n) : []);

const summarizeContext = (context = {}) => {
    const type = context?.type || "general";
    const base = {
        type,
        answer_mode: context?.answer_mode || null,
        confidence:
            typeof context?.confidence === "number" ? context.confidence : null,
        failure_reason: context?.failure_reason || null,
        answer_source: context?.answer_source || null,
    };

    if (type === "products") {
        return {
            ...base,
            items: takeTop(context?.items, 5).map((p) => ({
                product_id: p.product_id,
                name: p.name,
                category: p.category || null,
                price: p.price ?? null,
                original_price: p.original_price ?? null,
                quantity:
                    typeof p.quantity !== "undefined"
                        ? Number(p.quantity || 0)
                        : null,
                slug: p.slug || null,
            })),
        };
    }

    if (type === "services") {
        return {
            ...base,
            items: takeTop(context?.items, 5).map((s) => ({
                service_id: s.service_id,
                name: s.name,
                category: s.category || null,
                price: s.price ?? null,
                duration: s.duration ?? null,
            })),
        };
    }

    if (type === "orders") {
        return {
            ...base,
            items: takeTop(context?.items, 3).map((o) => ({
                order_code: o.order_code,
                status: o.status,
                total_price: o.total_price,
                created_at: o.created_at,
                item_count: o.item_count,
            })),
        };
    }

    if (type === "bookings") {
        return {
            ...base,
            items: takeTop(context?.items, 3).map((b) => ({
                booking_code: b.booking_code,
                status: b.status,
                date: b.date,
                check_in: b.check_in,
                check_out: b.check_out,
                total_price: b.total_price,
            })),
        };
    }

    if (type === "knowledge") {
        return {
            ...base,
            item: takeTop(context?.items, 1)[0]
                ? {
                      id:
                          takeTop(context?.items, 1)[0]?.product_id ||
                          takeTop(context?.items, 1)[0]?.service_id ||
                          null,
                      name: takeTop(context?.items, 1)[0]?.name || null,
                      category: takeTop(context?.items, 1)[0]?.category || null,
                  }
                : null,
            requested_knowledge_type: context?.requested_knowledge_type || null,
            knowledge_items: takeTop(context?.knowledge_items, 4).map((k) => ({
                knowledge_type: k.knowledge_type || null,
                title: k.title || null,
                content: k.content || k.text || null,
                source: k.source || null,
            })),
        };
    }
    if (type === "external_reference") {
        return {
            ...base,
            items: takeTop(context?.items, 2).map((x) => ({
                id: x.product_id || x.service_id || null,
                name: x.name || null,
            })),
            external_sources: takeTop(context?.external_sources, 4).map(
                (s) => ({
                    title: s.title || null,
                    snippet: s.snippet || null,
                    url: s.url || null,
                }),
            ),
        };
    }

    return {
        ...base,
        reply_hint: context?.reply || null,
    };
};

const buildSystemPrompt = ({ mode, responseLanguage }) => {
    const commonRules = [
        "Reply in the user's latest language.",
        "Maximum 3 short sentences.",
        "Be concise and practical.",
        "Do not invent facts.",
        "If the question is ambiguous, ask exactly 1 short clarifying question and stop.",
        "Do not add external links unless explicitly present in CONTEXT and allowed by mode.",
    ];

    const modeInstruction =
        mode === "db_strict"
            ? [
                  "Answer only from CONTEXT.",
                  "Only mention product facts, price, stock, booking, order, service, or variant data that already exist in CONTEXT.",
                  "If the data is missing, say that clearly.",
                  "Do not give broad advice or general pet knowledge.",
              ]
            : mode === "internal_knowledge"
              ? [
                    "Answer only from CONTEXT.",
                    "Prioritize knowledge_items first, then matched shop items.",
                    "If knowledge_items are empty, clearly say internal knowledge is not available yet.",
                    "Do not invent benefits, ingredients, warnings, usage instructions, suitability, or safety claims.",
                    "If the exact product/service is not resolved, ask 1 short clarification question and stop.",
                    "Answer only the requested knowledge aspect if requested_knowledge_type exists.",
                    "Do not default to ingredients unless the user explicitly asks about ingredients.",
                ]
              : mode === "external_reference"
                ? [
                      "Use only external_sources and grounded CONTEXT.",
                      "Clearly separate external reference information from shop data.",
                      "If external_sources are empty, say grounded outside sources are not available yet.",
                      "Do not provide diagnosis, prescription, or medical certainty.",
                  ]
                : [
                      "Use the provided CONTEXT when available.",
                      "If information is incomplete, say so clearly.",
                  ];

    return [
        "You are the AI assistant for a pet care ecommerce platform.",
        `Reply in ${responseLanguage}.`,
        "Rules:",
        ...commonRules.map((x) => `- ${x}`),
        ...modeInstruction.map((x) => `- ${x}`),
    ].join("\n");
};

const buildChatMessages = ({
    mode,
    intent,
    message,
    currentUser,
    context,
    analysis,
}) => {
    const responseLanguage = pickResponseLanguage(analysis);
    const system = buildSystemPrompt({ mode, responseLanguage });

    const userContext = {
        user_id: currentUser?.user_id || null,
        fullname: currentUser?.fullname || null,
        email: currentUser?.email || null,
        is_logged_in: Boolean(currentUser?.user_id),
    };

    const analysisSummary = summarizeAnalysis(analysis || {});
    const contextSummary = summarizeContext(context || {});

    const user = [
        `INTENT: ${intent}`,
        `MODE: ${mode || "general_fallback"}`,
        `USER: ${JSON.stringify(userContext)}`,
        `ANALYSIS: ${JSON.stringify(analysisSummary)}`,
        `CONTEXT: ${JSON.stringify(contextSummary)}`,
        "",
        "QUESTION:",
        String(message || ""),
    ].join("\n");

    return [
        { role: "system", content: system },
        { role: "user", content: user },
    ];
};

module.exports = buildChatMessages;
