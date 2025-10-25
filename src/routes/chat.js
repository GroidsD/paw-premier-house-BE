import express from "express";
import openai from "../config/openAI.js";
import supabase from "../config/supabase.js";

const router = express.Router();

router.post("/api/chatCompletion", async (req, res) => {
    try {
        const { message } = req.body;

        // 🔹 1. Phát hiện ngôn ngữ
        const isEnglish = /[a-zA-Z]/.test(message) && !/[à-ỹ]/i.test(message);
        const lang = isEnglish ? "en" : "vi";
        console.log(`🌐 Detected language: ${lang}`);

        // 🔹 2. Phát hiện câu xã giao (chào hỏi)
        const greetings = [
            "hello",
            "hi",
            "hey",
            "xin chào",
            "chào",
            "chào bạn",
        ];
        const lowerMsg = message.toLowerCase();

        const isGreeting = greetings.some((g) => lowerMsg.includes(g));

        // Nếu là câu chào xã giao → bỏ qua vector search
        if (isGreeting) {
            const reply =
                lang === "en"
                    ? "Hello! How can I help you today?"
                    : "Chào bạn! Mình có thể giúp gì cho bạn hôm nay?";
            return res.json({ reply, lang, matches: [] });
        }

        // 🔹 3. Tạo embedding cho câu hỏi
        const embeddingRes = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: message,
        });
        const queryEmbedding = embeddingRes.data[0].embedding;

        // 🔹 4. Gọi Supabase RPC với lang
        const { data: matches, error } = await supabase.rpc(
            "match_product_vectors",
            {
                query_embedding: queryEmbedding,
                match_threshold: 0.7,
                match_count: 5,
                query_lang: lang,
            }
        );

        if (error) throw error;

        let context = "";
        if (matches && matches.length > 0) {
            context = matches
                .map((m, i) => `Product #${i + 1}: ${m.content}`)
                .join("\n---\n");
        } else {
            context =
                lang === "en"
                    ? "No matching products were found in the database."
                    : "Không tìm thấy sản phẩm nào phù hợp trong cơ sở dữ liệu.";
        }

        // 🔹 5. Prompt
        const prompt =
            lang === "en"
                ? `
Here are some related products from the database:
${context}

Customer question: "${message}"

Please answer in English, briefly and accurately, based only on the provided product data.
If no match is found, say so clearly.
`
                : `
Dưới đây là một số sản phẩm từ cơ sở dữ liệu:
${context}

Câu hỏi của khách: "${message}"

Hãy trả lời bằng tiếng Việt, ngắn gọn, tự nhiên và đúng với thông tin thật của sản phẩm.
Nếu không có sản phẩm phù hợp, hãy nói rõ là không có.
`;

        // 🔹 6. Gọi OpenAI để trả lời
        const aiRes = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const reply = aiRes.choices[0].message.content.trim();
        res.json({ reply, lang, matches });
    } catch (err) {
        console.error("❌ ChatCompletion error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
