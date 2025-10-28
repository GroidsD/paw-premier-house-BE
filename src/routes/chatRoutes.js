// // routes/chatRoutes.js
// const express = require("express");
// const OpenAI = require("openai");
// const supabase = require("../config/supabase.js");

// const router = express.Router();
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// router.post("/api/chatCompletion", async (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") return res.status(204).end();

//   try {
//     const {
//       messages,
//       model = "gpt-4o-mini-2024-07-18",
//       temperature = 0.7,
//       max_tokens = 512,
//     } = req.body || {};
//     if (!Array.isArray(messages) || messages.length === 0) {
//       return res
//         .status(400)
//         .json({ error: "messages là bắt buộc (định dạng OpenAI chat)" });
//     }

//     const completion = await client.chat.completions.create({
//       model,
//       messages,
//       temperature: 0,
//       max_tokens,
//     });

//     return res.status(200).json(completion);
//   } catch (err) {
//     console.error("OpenAI error:", err);
//     return res.status(500).json({ error: err?.message || "Unknown error" });
//   }
// });

// // RAG-based chat endpoint: embed user query, retrieve similar product docs, and ground the answer.
// router.post("/api/ragChat", async (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === "OPTIONS") return res.status(204).end();

//   try {
//     const {
//       query,
//       topK = 8,
//       similarity_threshold = 0.5,
//       model = "gpt-4o-mini-2024-07-18",
//       temperature = 0.2,
//       max_tokens = 512,
//     } = req.body || {};

//     if (!query || typeof query !== "string") {
//       return res.status(400).json({ error: "Thiếu query (string)" });
//     }

//     // 1) Create embedding for the user query
//     const embedResp = await client.embeddings.create({
//       model: "text-embedding-3-small",
//       input: query,
//     });
//     const queryEmbedding = embedResp?.data?.[0]?.embedding;
//     if (!queryEmbedding) {
//       return res
//         .status(500)
//         .json({ error: "Không tạo được embedding cho truy vấn" });
//     }

//     // 2) Vector similarity search via Supabase RPC (requires a SQL function in DB)
//     // You should create a Postgres function (e.g., match_products) that searches products_vectors by cosine similarity.
//     // Example SQL to set up (run in Supabase SQL editor):
//     // create or replace function match_products(query_embedding vector(1536), match_count int default 5, similarity_threshold float default 0.8)
//     // returns table(id text, content text, similarity float)
//     // language sql stable as $$
//     //   select id, content, 1 - (embedding <=> query_embedding) as similarity
//     //   from products_vectors
//     //   where 1 - (embedding <=> query_embedding) >= similarity_threshold
//     //   order by embedding <=> query_embedding
//     //   limit match_count
//     // $$;

//     let { data: matches, error: matchErr } = await supabase.rpc(
//       "match_products",
//       {
//         query_embedding: queryEmbedding,
//         match_count: topK,
//         similarity_threshold,
//       }
//     );
//     if (matchErr) {
//       console.error("Supabase match error:", matchErr);
//       return res.status(500).json({
//         error:
//           "Lỗi truy vấn vector (kiểm tra hàm RPC match_products và bảng products_vectors)",
//       });
//     }

//     // Fallback: if no matches, try again with threshold 0 to fetch the nearest neighbors
//     if (!matches || matches.length === 0) {
//       const retry = await supabase.rpc("match_products", {
//         query_embedding: queryEmbedding,
//         match_count: topK,
//         similarity_threshold: 0,
//       });
//       if (!retry.error) {
//         matches = retry.data || [];
//       }
//     }

//     // 3) Build grounded context
//     const context = (matches || [])
//       .map((m, i) => `${i + 1}. ${m.content}`)
//       .join("\n");

//     // If still no matches, return a deterministic message instead of generic LLM output
//     if (!matches || matches.length === 0) {
//       return res.status(200).json({
//         choices: [
//           {
//             index: 0,
//             message: {
//               role: "assistant",
//               content:
//                 "Không tìm thấy sản phẩm phù hợp trong cơ sở dữ liệu dựa trên truy vấn của bạn. Vui lòng mô tả chi tiết hơn (tên, hương vị, kích cỡ, giống thú cưng, mức giá, v.v.).",
//             },
//             finish_reason: "stop",
//           },
//         ],
//         context_count: 0,
//       });
//     }

//     // 4) Compose messages: instruct model to answer only from context
//     const messages = [
//       {
//         role: "system",
//         content:
//           "Bạn là trợ lý bán hàng cho cửa hàng thú cưng. Chỉ sử dụng DUY NHẤT thông tin trong CONTEXT để trả lời. KHÔNG bịa, KHÔNG dùng kiến thức chung. Luôn trả lời bằng tiếng Việt. Nếu thiếu thông tin trong CONTEXT, hãy nói rằng bạn không biết. Khi có sản phẩm phù hợp, hãy liệt kê dạng danh sách: Tên – mô tả ngắn – Giá (nếu có).",
//       },
//       { role: "system", content: `CONTEXT (sản phẩm):\n${context}` },
//       { role: "user", content: query },
//     ];

//     const completion = await client.chat.completions.create({
//       model,
//       messages,
//       temperature,
//       max_tokens,
//     });

//     return res.status(200).json({
//       choices: completion.choices,
//       context_count: matches?.length || 0,
//     });
//   } catch (err) {
//     console.error("RAG chat error:", err);
//     return res.status(500).json({ error: err?.message || "Unknown error" });
//   }
// });

// module.exports = router;
