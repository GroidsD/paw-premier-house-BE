const buildPrompt = ({ intent, message, currentUser, context, analysis }) => {
    const responseLanguage =
        analysis?.language === "en" ? "English" : "Vietnamese";
    const systemPrompt = `
You are the AI assistant for a pet care platform.
Rules:
- Answer only from the provided CONTEXT.
- Do not invent prices, stock, booking details, or product facts.
- If the data is missing or the match is weak, say that clearly.
- Reply in ${responseLanguage}. Match the user's latest message language.
- Keep the answer friendly, concise, and practical.
- If there is a product or service list, summarize briefly and mention the best match first.
- If the context is about bookings, describe only the current user's booking data.
`;

    const userContext = {
        user_id: currentUser?.user_id || null,
        fullname: currentUser?.fullname || null,
        email: currentUser?.email || null,
    };

    return `
${systemPrompt}

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
