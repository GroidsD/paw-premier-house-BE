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
import conversationMemory from "./conversationMemory.js";

// ------------------------- Main Handler -------------------------
export async function handleUserQuery({ userId = null, text }) {
    const userLang = detectLanguage(text);
    const sessionId = userId || "anonymous";

    try {
        // 1️⃣ Lưu user message vào memory
        conversationMemory.addMessage(sessionId, "user", text);

        // 2️⃣ Lấy context từ lịch sử
        const history = conversationMemory.getHistory(sessionId, 3);
        const userProfile = conversationMemory.analyzeUserIntent(sessionId);

        // 3️⃣ Phân loại intent với context
        const intentRes = await classifyIntent(text, history);
        const intent = intentRes.intent?.toLowerCase() ?? "other";
        const entities = intentRes.entities || {};

        console.log("🧭 Intent:", intent, "| Entities:", entities, "| Lang:", userLang);
        console.log("👤 User profile:", userProfile);

        let response = "";

        switch (intent) {
            case "greeting":
                response = userLang === "en"
                    ? "👋 Hello! How can I help you find the perfect products for your pet today?"
                    : "👋 Xin chào! Mình có thể giúp bạn tìm sản phẩm gì cho thú cưng hôm nay?";
                break;

            case "top_selling":
                response = formatProducts(
                    await getTopSelling(5),
                    userLang === "en"
                        ? "🔥 Top selling products:"
                        : "🔥 Top sản phẩm bán chạy nhất:",
                    userLang
                );
                break;

            case "low_stock":
                response = formatProducts(
                    await getLowStock(5),
                    userLang === "en"
                        ? "⚠️ Low stock products:"
                        : "⚠️ Sản phẩm sắp hết hàng:",
                    userLang
                );
                break;

            case "discounted":
                response = formatProducts(
                    await getDiscounted(5),
                    userLang === "en"
                        ? "💰 Discounted products:"
                        : "💰 Sản phẩm đang giảm giá:",
                    userLang
                );
                break;

            case "recommend":
                response = formatProducts(
                    await recommendForUser({
                        userId,
                        userText: text,
                        userProfile, // Truyền user profile
                        language: userLang, // Truyền language
                        limit: 5,
                    }),
                    userLang === "en"
                        ? "✨ Recommended products for you:"
                        : "✨ Gợi ý sản phẩm cho bạn:",
                    userLang
                );
                break;

            case "price_inquiry":
                response = await handlePriceQuery(text, userLang, entities);
                break;

            case "price_range":
                response = await handlePriceRangeQuery(entities.price_range, userLang, entities);
                break;

            case "highest_price":
                response = formatProductsWithHighlight(
                    await getTopExpensive(5),
                    userLang,
                    true
                );
                break;

            case "lowest_price":
                response = formatProductsWithHighlight(
                    await getLowestPrice(5),
                    userLang,
                    false
                );
                break;

            case "product_search":
            case "product_info":
            default:
                response = await handleProductInfoQuery(text, userLang, entities);
                break;
        }

        // 4️⃣ Lưu assistant response vào memory
        conversationMemory.addMessage(sessionId, "assistant", response);

        return response;

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
async function handlePriceQuery(text, lang, entities = {}) {
    // Sử dụng filters từ entities
    const filters = buildFilters(entities);

    const results = await semanticSearchProducts(text, lang, 1, filters);
    if (!results || results.length === 0)
        return lang === "en"
            ? "Sorry, no matching products found 😅"
            : "Xin lỗi, mình chưa tìm thấy sản phẩm phù hợp 😅";

    const p = results[0];
    const nameObj =
        p.translates.find((t) => t.language === lang) || p.translates[0];
    return `${lang === "en" ? "Price" : "Giá"} của ${nameObj.name
        }: **${formatPrice(p.price, lang)}**`;
}

// ------------------------- Handle price range queries -------------------------
async function handlePriceRangeQuery(priceRange, lang, entities = {}) {
    if (!priceRange) {
        return lang === "en"
            ? "Please specify a price range (e.g., 'under 100k' or '50k to 200k')"
            : "Vui lòng chỉ rõ khoảng giá (ví dụ: 'dưới 100k' hoặc '50k đến 200k')";
    }

    const filters = buildFilters({ ...entities, price_range: priceRange });
    const results = await semanticSearchProducts("", lang, 10, filters);

    if (!results || results.length === 0) {
        return lang === "en"
            ? `No products found in the price range ${formatPrice(priceRange.min, lang)} - ${formatPrice(priceRange.max, lang)}`
            : `Không tìm thấy sản phẩm trong khoảng giá ${formatPrice(priceRange.min, lang)} - ${formatPrice(priceRange.max, lang)}`;
    }

    const title = lang === "en"
        ? `💵 Products in range ${formatPrice(priceRange.min, lang)} - ${formatPrice(priceRange.max, lang)}:`
        : `💵 Sản phẩm trong khoảng ${formatPrice(priceRange.min, lang)} - ${formatPrice(priceRange.max, lang)}:`;

    return formatProducts(results, title, lang);
}

// ------------------------- Handle generic product info -------------------------
async function handleProductInfoQuery(text, lang, entities = {}) {
    let query = text.toLowerCase();

    // Build filters từ entities
    const filters = buildFilters(entities);

    // Boost embedding nếu có từ "cat/meo" hoặc "dog/cho"
    if (/(mèo|cat)/.test(query)) query += " cat";
    else if (/(chó|dog)/.test(query)) query += " dog";

    let results = await semanticSearchProducts(query, lang, 10, filters);

    // Fallback nếu không có kết quả
    if (results.length === 0 && lang === "vi") {
        results = await semanticSearchProducts(query, "en", 5, filters);
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

// ------------------------- Build filters from entities -------------------------
function buildFilters(entities) {
    const filters = {};

    if (entities.category) {
        filters.category = entities.category;
    }

    if (entities.pet_type) {
        filters.pet_type = entities.pet_type;
    }

    if (entities.price_range) {
        filters.price_range = entities.price_range;
    }

    return filters;
}

// ------------------------- Format products -------------------------
function formatProducts(products, title, lang = "vi") {
    if (!products || products.length === 0) {
        return lang === "en"
            ? "No matching products found."
            : "Không tìm thấy sản phẩm phù hợp.";
    }

    // Lọc products có translation cho ngôn ngữ yêu cầu
    let filtered = products.filter((p) =>
        p.translates?.some((t) => t.language === lang)
    );

    // Nếu không có, fallback sang ngôn ngữ có sẵn
    if (!filtered.length) {
        console.log(`⚠️ No products with ${lang} translation, using available language`);
        filtered = products;
        // Detect ngôn ngữ có sẵn
        const availableLang = products[0]?.translates?.[0]?.language || lang;
        console.log(`📝 Using language: ${availableLang}`);
        lang = availableLang;
    }

    let msg = `\n${title}\n`;
    for (const p of filtered) {
        const nameObj =
            p.translates?.find((t) => t.language === lang) || p.translates?.[0];
        if (nameObj) {
            msg += `• ${nameObj.name} – **${formatPrice(p.price, lang)}**\n`;
        }
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
    msg += `\n${mostExpensive
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
