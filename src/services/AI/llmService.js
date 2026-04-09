const OpenAI = require("openai");
const aiConfig = require("../../config/openAI");

const client = new OpenAI({
    apiKey: aiConfig.apiKey,
});

const generateReply = async (prompt) => {
    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.2,
    });

    return (
        completion.choices?.[0]?.message?.content ||
        "Xin lỗi, tôi chưa thể trả lời lúc này."
    );
};

module.exports = {
    generateReply,
};
