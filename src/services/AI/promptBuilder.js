const buildPrompt = ({
    mode,
    intent,
    message,
    currentUser,
    context,
    analysis,
}) => {
    const responseLanguage =
        analysis?.language === "en" ? "English" : "Vietnamese";

    const modeInstruction =
        mode === "db_strict"
            ? `
- Answer only from the provided CONTEXT.
- Do not invent prices, stock, booking details, order details, service details, or product facts.
- If the data is missing or the match is weak, say that clearly.
`
            : mode === "internal_knowledge"
              ? `
- Answer only from the provided CONTEXT.
- Prioritize knowledge_items and matched shop items.
- Do not invent benefits, ingredients, warnings, or usage instructions beyond the provided context.
- Do not infer missing usage instructions from product names alone.
- If internal knowledge is missing, say that clearly.
`
              : mode === "external_reference"
                ? `
- Use only the information provided in CONTEXT, especially external_sources.
- If external_sources are empty, clearly say that external grounded references are not connected yet.
- Clearly distinguish between shop data and external reference information.
- Do not present speculative information as official shop facts.
`
                : `
- Answer only from the provided CONTEXT.
- If the information is incomplete, say so clearly.
`;

    const systemPrompt = `
You are the AI assistant for a pet care platform.
Rules:
${modeInstruction}
- Reply in ${responseLanguage}. Match the user's latest message language.
- Keep the answer friendly, concise, and practical.
- If there is a product or service list, summarize briefly and mention the best match first.
- If the context is about bookings or orders, describe only the current user's data.
`;

    const userContext = {
        user_id: currentUser?.user_id || null,
        fullname: currentUser?.fullname || null,
        email: currentUser?.email || null,
    };

    return `
${systemPrompt}

MODE:
${mode || "general_fallback"}

INTENT:
${intent}

USER:
${JSON.stringify(userContext, null, 2)}

QUESTION:
${message}

ANALYSIS:
${JSON.stringify(analysis || {}, null, 2)}

CONTEXT:
${JSON.stringify(context, null, 2)}

Create the final answer now.
`;
};

module.exports = buildPrompt;
