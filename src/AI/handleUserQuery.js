import openai from "../config/openAI.js";
import supabase from "../config/supabase.js";
import { semanticSearchProducts } from "./semanticSearch.js";
import {
    getTopSelling,
    getLowStock,
    getDiscounted,
    getTopExpensive,
    getLowestPrice,
} from "./statsQueries.js";
import { recommendForUser } from "./recommendService.js";
import { classifyIntent } from "./classifyIntent.js";

// ------------------------- Main Handler -------------------------
export async function handleUserQuery({ userId = null, text }) {
    const userLang = detectLanguage(text); // "vi" hoặc "en"

    try {
        // 1️⃣ Phân loại intent
        const intentRes = await classifyIntent(text);
        const intent = intentRes.intent?.toLowerCase() ?? "other";
        console.log("🧭 intent:", intent, "lang:", userLang);

        switch (intent) {
            case "top_selling":
                return formatProducts(
                    await getTopSelling(5),
                    userLang === "en"
                        ? "🔥 Top selling products:"
                        : "🔥 Top sản phẩm bán chạy nhất:",
                    userLang
                );

            case "low_stock":
                return formatProducts(
                    await getLowStock(5),
                    userLang === "en"
                        ? "⚠️ Low stock products:"
                        : "⚠️ Sản phẩm sắp hết hàng:",
                    userLang
                );

            case "discounted":
                return formatProducts(
                    await getDiscounted(5),
                    userLang === "en"
                        ? "💰 Discounted products:"
                        : "💰 Sản phẩm đang giảm giá:",
                    userLang
                );

            case "recommend":
                return formatProducts(
                    await recommendForUser({
                        userId,
                        userText: text,
                        limit: 5,
                    }),
                    userLang === "en"
                        ? "✨ Recommended products for you:"
                        : "✨ Gợi ý sản phẩm cho bạn:",
                    userLang
                );

            case "price":
                return await handlePriceQuery(text, userLang);

            case "highest_price":
                return formatProductsWithHighlight(
                    await getTopExpensive(5),
                    userLang,
                    true
                );

            case "lowest_price":
                return formatProductsWithHighlight(
                    await getLowestPrice(5),
                    userLang,
                    false
                );

            case "product_info":
            default:
                return await handleProductInfoQuery(text, userLang);
        }
    } catch (err) {
        console.error("❌ handleUserQuery error:", err);
        return userLang === "en"
            ? "Error occurred while processing your query 😢"
            : "Đã xảy ra lỗi khi xử lý câu hỏi 😢";
    }
}

// ------------------------- Detect language -------------------------
function detectLanguage(text) {
    const vietnameseChars =
        /[àáạảãâầấậẩẫăằắặẳẵđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i;
    if (vietnameseChars.test(text)) return "vi";
    return "en";
}

// ------------------------- Handle price queries -------------------------
async function handlePriceQuery(text, lang) {
    const results = await semanticSearchProducts(text, lang, 1);
    if (!results || results.length === 0)
        return lang === "en"
            ? "Sorry, no matching products found 😅"
            : "Xin lỗi, mình chưa tìm thấy sản phẩm phù hợp 😅";

    const p = results[0];
    const nameObj =
        p.translates.find((t) => t.language === lang) || p.translates[0];
    return `${lang === "en" ? "Price" : "Giá"} của ${
        nameObj.name
    }: **${formatPrice(p.price, lang)}**`;
}

// ------------------------- Handle generic product info -------------------------
async function handleProductInfoQuery(text, lang) {
    let query = text.toLowerCase();

    // Boost embedding nếu có từ "cat/meo" hoặc "dog/cho"
    if (/(mèo|cat)/.test(query)) query += " cat";
    else if (/(chó|dog)/.test(query)) query += " dog";

    let results = await semanticSearchProducts(query, lang, 10); // tăng limit

    // Filter theo category nếu query chứa từ khóa
    if (/đồ chơi|toy/.test(query)) {
        results = results.filter((p) =>
            p.category?.toLowerCase().includes("toy")
        );
    } else if (/phụ kiện|accessory/.test(query)) {
        results = results.filter((p) =>
            p.category?.toLowerCase().includes("accessory")
        );
    } else if (/thức ăn|food/.test(query)) {
        results = results.filter((p) =>
            p.category?.toLowerCase().includes("food")
        );
    }

    if (results.length === 0 && lang === "vi") {
        results = await semanticSearchProducts(query, "en", 5);
    }

    if (!results || results.length === 0)
        return lang === "en"
            ? "Sorry, no matching products found 😅"
            : "Xin lỗi, mình chưa tìm thấy sản phẩm phù hợp 😅";

    return formatProducts(
        results,
        lang === "en" ? "📦 Related products:" : "📦 Sản phẩm liên quan:",
        lang
    );
}

// ------------------------- Format products -------------------------
function formatProducts(products, title, lang = "vi") {
    const filtered = products.filter((p) =>
        p.translates?.some((t) => t.language === lang)
    );

    if (!filtered.length) {
        // fallback dùng ngôn ngữ đầu tiên
        products.forEach((p) => {
            if (!p.translates) p.translates = [];
        });
        return products.length
            ? formatProducts(
                  products,
                  title,
                  products[0].translates[0].language
              )
            : lang === "en"
            ? "No matching products found."
            : "Không tìm thấy sản phẩm phù hợp.";
    }

    let msg = `\n${title}\n`;
    for (const p of filtered) {
        const nameObj =
            p.translates.find((t) => t.language === lang) || p.translates[0];
        msg += `• ${nameObj.name} – **${formatPrice(p.price, lang)}**\n`;
    }
    return msg;
}

// ------------------------- Format products with highlight -------------------------
function formatProductsWithHighlight(
    products,
    lang = "vi",
    mostExpensive = true
) {
    if (!products || products.length === 0)
        return lang === "en"
            ? "No matching products found."
            : "Không tìm thấy sản phẩm phù hợp.";

    const filtered = products.filter((p) =>
        p.translates?.some((t) => t.language === lang)
    );

    if (!filtered.length)
        return formatProducts(
            products,
            mostExpensive
                ? "💎 Most expensive products:"
                : "💸 Cheapest products:",
            lang
        );

    // Sort theo giá
    filtered.sort((a, b) =>
        mostExpensive ? b.price - a.price : a.price - b.price
    );

    const title = mostExpensive
        ? lang === "en"
            ? "💎 Most expensive products:"
            : "💎 Top sản phẩm giá cao nhất:"
        : lang === "en"
        ? "💸 Cheapest products:"
        : "💸 Top sản phẩm giá rẻ nhất:";

    let msg = `\n${title}\n`;
    for (const p of filtered) {
        const nameObj =
            p.translates.find((t) => t.language === lang) || p.translates[0];
        msg += `• ${nameObj.name} – **${formatPrice(p.price, lang)}**\n`;
    }

    // Highlight first product
    const first = filtered[0];
    const firstName = first.translates.find((t) => t.language === lang).name;
    const firstPrice = formatPrice(first.price, lang);
    msg += `\n${
        mostExpensive
            ? lang === "en"
                ? "Most expensive product"
                : "Sản phẩm mắc nhất"
            : lang === "en"
            ? "Cheapest product"
            : "Sản phẩm rẻ nhất"
    }: ${firstName} – **${firstPrice}**`;

    return msg;
}

// ------------------------- Format price -------------------------
function formatPrice(price, lang = "vi") {
    if (!price || typeof price !== "number")
        return lang === "en" ? "Contact for price" : "Giá liên hệ";
    return lang === "en"
        ? `$${(price / 23000).toFixed(2)}`
        : price.toLocaleString("vi-VN") + "₫";
}
