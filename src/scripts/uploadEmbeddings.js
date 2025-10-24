// src/scripts/uploadEmbeddings.js
import { getAllProducts } from "../services/ProductService.js";
import supabase from "../config/supabaseClient.js";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function uploadEmbeddings() {
  const products = await getAllProducts(); // lấy từ DB
  for (const product of products) {
    const viTrans = product.translations.find((t) => t.lang === "vi");
    if (!viTrans) continue;

    const text = `${viTrans.name}. ${viTrans.description}`;
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    const [{ embedding }] = embeddingResponse.data;

    const { error } = await supabase.from("products_vectors").insert({
      id: product.product_id,
      content: text,
      embedding,
    });

    if (error) console.error("❌ Lỗi khi upload:", error);
    else console.log(`✅ Upload embedding cho: ${viTrans.name}`);
  }
  console.log("🎉 Hoàn tất upload embeddings!");
}

uploadEmbeddings();
