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

        // const isGreeting = greetings.some((g) => lowerMsg.includes(g));
        const isGreeting = greetings.some((g) => lowerMsg.trim() === g);

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
                    ? "No matching products were found in shop."
                    : "Không tìm thấy sản phẩm nào phù hợp trong cửa hàng.";
        }

        // 🔹 5. Prompt (song ngữ, format đẹp)
        const prompt =
            lang === "en"
                ? `
You are a friendly pet shop assistant 🐾.  
Please answer the user's question **based only** on the products below.

Products:
${context}

User question: "${message}"

💬 **Rules for your answer:**
- Reply **naturally in English**.  
- Use **Markdown** format.  
- Use cute and relevant emojis (🐶🐱🧴🍖🛒💚).  
- Each product = a bullet point with:  
  → **Bold name**, short description, and **price**.  
- Keep the message clean, warm, and concise.  
- End with a friendly closing line (e.g., _Would you like more suggestions? 💕_).

🧾 **Example Response:**
🐾 Hello there! Here are some products you might love:

- 🐕 **Premium Dog Leash** — Durable and safe. Price: **500,000 VND**  
- 🧴 **Pet Shampoo** — Keeps your pet’s fur soft and shiny. Price: **150,000 VND**  
- 🍗 **Dog Food Deluxe** — Perfect for small breeds. Price: **300,000 VND**

> Would you like to see more options for your furry friend? 💕
`
                : `
Bạn là **trợ lý bán hàng thân thiện của cửa hàng thú cưng** 🐾.  
Hãy trả lời câu hỏi của khách **dựa chính xác vào dữ liệu sản phẩm bên dưới**.

Sản phẩm có trong cơ sở dữ liệu:
${context}

Câu hỏi khách hàng: "${message}"

💬 **Quy tắc trả lời:**
- Trả lời **tự nhiên, vui vẻ, dễ thương**.  
- Dạng **Markdown** (để hiển thị đẹp trên web).  
- Dùng emoji phù hợp (🐕🐈🧴🍖🛒💚).  
- Mỗi sản phẩm là 1 gạch đầu dòng:  
  → **In đậm tên**, mô tả ngắn, và **giá**.  
- Cuối câu nên có lời mời nhẹ nhàng (vd: "_Bạn muốn mình gợi ý thêm không ạ? 💕_").

🧾 **Ví dụ phản hồi đẹp:**

🐾 Xin chào bạn! Mình có vài sản phẩm cho bé cưng của bạn nè:

- 🧴 **Dầu gội cho thú cưng** — Giúp lông mượt và thơm lâu. Giá: **150.000 VNĐ**  
- 🍗 **Thức ăn hạt cao cấp** — Dành cho chó nhỏ. Giá: **300.000 VNĐ**  
- 🐕 **Dây dắt chó cao cấp** — Bền và an toàn. Giá: **500.000 VNĐ**

> Bạn muốn mình gợi ý thêm vài món khác cho bé cưng không ạ? 💕
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
