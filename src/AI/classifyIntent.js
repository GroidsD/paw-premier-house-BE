import openai from "../config/openAI.js";

export async function classifyIntent(text) {
    const prompt = `
Bạn là bộ phân loại intent cho chatbot e-commerce. 
Phân loại câu hỏi người dùng (tiếng Việt hoặc tiếng Anh) thành một trong các intent:
["product_info","top_selling","low_stock","discounted","recommend","price","lowest_price","other"].
Trả về JSON duy nhất: {"intent":"...", "confidence":0.0}
Câu: """${text}"""
`;

    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 100,
        temperature: 0,
    });

    const content = res.choices?.[0]?.message?.content ?? "";
    try {
        const jsonText = content.trim().match(/\{[\s\S]*\}/)?.[0] ?? content;
        return JSON.parse(jsonText);
    } catch {
        const t = text.toLowerCase();
        if (/(giá|bao nhiêu|price)/.test(t)) {
            if (/(mắc nhất|giá cao nhất|highest)/.test(t))
                return { intent: "highest_price", confidence: 0.9 };
            if (/(rẻ nhất|giá thấp nhất|lowest)/.test(t))
                return { intent: "lowest_price", confidence: 0.9 };
            return { intent: "price", confidence: 0.8 };
        }
        if (/(bán chạy|hot|best)/.test(t))
            return { intent: "top_selling", confidence: 0.7 };
        if (/(sắp hết|còn lại|low stock)/.test(t))
            return { intent: "low_stock", confidence: 0.7 };
        if (/(giảm giá|sale|khuyến mãi)/.test(t))
            return { intent: "discounted", confidence: 0.7 };
        if (/(gợi ý|recommend)/.test(t))
            return { intent: "recommend", confidence: 0.7 };
        return { intent: "product_info", confidence: 0.5 };
    }
}
