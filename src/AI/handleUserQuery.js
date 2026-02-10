import { semanticSearchProducts } from "./products/semanticSearch.js";
import { semanticSearchServices } from "./services/semanticSearch.js";
import {
    getTopSelling,
    getLowStock,
    getDiscounted,
    getTopExpensive,
    getLowestPrice,
} from "./products/statsQueries.js";
import { recommendForUser } from "./products/recommendProducts.js";
import { recommendServices } from "./services/recommendServices.js";
import { classifyIntent } from "./classifyIntent.js";
import conversationMemory from "./conversationMemory.js";


export async function handleUserQuery({ userId = null, text }) {
    const userLang = detectLanguage(text);
    const sessionId = userId || "anonymous";

    try {
        
        conversationMemory.addMessage(sessionId, "user", text);

        
        const history = conversationMemory.getHistory(sessionId, 3);
        const userProfile = conversationMemory.analyzeUserIntent(sessionId);

        
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
                        userProfile, 
                        language: userLang, 
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

            case "service_price":
                response = await handleServicePriceQuery(text, userLang, entities, userProfile);
                break;

            case "service_booking":
                response = await handleServiceBookingQuery(text, userLang, entities, userProfile);
                break;

            case "service_recommend":
                response = formatServices(
                    await recommendServices({
                        userId,
                        userText: text,
                        userProfile,
                        entities,
                        language: userLang,
                        limit: 5,
                    }),
                    userLang === "en"
                        ? "✨ Service recommendations for you:"
                        : "✨ Gợi ý dịch vụ cho bạn:",
                    userLang
                );
                break;

            case "service_search":
                response = await handleServiceSearchQuery(text, userLang, entities, userProfile);
                break;

            case "product_search":
            case "product_info":
            default:
                response = await handleProductInfoQuery(text, userLang, entities);
                break;
        }

        
        conversationMemory.addMessage(sessionId, "assistant", response);

        return response;

    } catch (err) {
        console.error("❌ handleUserQuery error:", err);
        return userLang === "en"
            ? "Error occurred while processing your query 😢"
            : "Đã xảy ra lỗi khi xử lý câu hỏi 😢";
    }
}


function detectLanguage(text) {
    const vietnameseChars =
        /[àáạảãâầấậẩẫăằắặẳẵđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ]/i;
    if (vietnameseChars.test(text)) return "vi";
    return "en";
}


async function handlePriceQuery(text, lang, entities = {}) {
    
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


async function handleProductInfoQuery(text, lang, entities = {}) {
    let query = text.toLowerCase();

    
    const filters = buildFilters(entities);

    
    if (/(mèo|cat)/.test(query)) query += " cat";
    else if (/(chó|dog)/.test(query)) query += " dog";

    let results = await semanticSearchProducts(query, lang, 10, filters);

    
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


async function handleServiceSearchQuery(text, lang, entities = {}, userProfile = {}) {
    const filters = buildServiceFilters(entities, userProfile);
    const results = await semanticSearchServices(text, lang, 5, filters);

    if (!results || results.length === 0) {
        return lang === "en"
            ? "I couldn't find a matching service yet. Could you describe it differently?"
            : "Mình chưa tìm thấy dịch vụ phù hợp, bạn mô tả chi tiết hơn giúp mình nhé?";
    }

    return formatServices(
        results,
        lang === "en" ? "🛁 Recommended services:" : "🛁 Các dịch vụ phù hợp:",
        lang
    );
}


async function handleServicePriceQuery(text, lang, entities = {}, userProfile = {}) {
    const filters = buildServiceFilters(entities, userProfile);
    const results = await semanticSearchServices(text, lang, 1, filters);

    if (!results || results.length === 0) {
        return lang === "en"
            ? "Sorry, I couldn't pinpoint that service price."
            : "Xin lỗi, mình chưa tìm được giá dịch vụ bạn cần.";
    }

    const service = results[0];
    const nameObj =
        service.translates.find((t) => t.language === lang) ||
        service.translates[0];

    return lang === "en"
        ? `The price for **${nameObj.name}** is **${formatPrice(service.price, lang)}**.`
        : `Giá của **${nameObj.name}** là **${formatPrice(service.price, lang)}**.`;
}


async function handleServiceBookingQuery(text, lang, entities = {}, userProfile = {}) {
    const filters = buildServiceFilters(entities, userProfile);
    const results = await semanticSearchServices(text, lang, 3, filters);

    if (!results || results.length === 0) {
        return lang === "en"
            ? "Please tell me which service you want to book so I can guide you."
            : "Bạn cho mình biết rõ dịch vụ muốn đặt để mình hướng dẫn nhé.";
    }

    const service = results[0];
    const nameObj =
        service.translates.find((t) => t.language === lang) ||
        service.translates[0];

    return lang === "en"
        ? `To book **${nameObj.name}**, let me know your preferred time slot and pet info. I will create the booking in our system or you can visit the schedule page in the app.`
        : `Để đặt dịch vụ **${nameObj.name}**, bạn cho mình biết khung giờ mong muốn và thông tin thú cưng. Mình sẽ hỗ trợ tạo lịch hoặc bạn có thể đặt trực tiếp trong ứng dụng tại mục lịch hẹn.`;
}


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

function buildServiceFilters(entities = {}, userProfile = {}) {
    const filters = {};

    if (entities.service_category) {
        filters.category = entities.service_category;
    } else if (userProfile.serviceInterests?.length) {
        filters.category = userProfile.serviceInterests[0];
    }

    if (entities.price_range) {
        filters.price_range = entities.price_range;
    } else if (userProfile.priceRange) {
        filters.price_range = userProfile.priceRange;
    }

    return filters;
}


function formatProducts(products, title, lang = "vi") {
    if (!products || products.length === 0) {
        return lang === "en"
            ? "No matching products found."
            : "Không tìm thấy sản phẩm phù hợp.";
    }

    
    let filtered = products.filter((p) =>
        p.translates?.some((t) => t.language === lang)
    );

    
    if (!filtered.length) {
        console.log(`⚠️ No products with ${lang} translation, using available language`);
        filtered = products;
        
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


function formatServices(services, title, lang = "vi") {
    if (!services || services.length === 0) {
        return lang === "en"
            ? "No services match yet."
            : "Không tìm thấy dịch vụ phù hợp.";
    }

    let msg = `\n${title}\n`;
    for (const service of services) {
        const translations = service.translates || [];
        const nameObj =
            translations.find((t) => t.language === lang) || translations[0];
        msg += `• ${nameObj?.name || "Dịch vụ"} – **${formatPrice(service.price, lang)}**\n`;
    }

    return msg;
}


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


function formatPrice(price, lang = "vi") {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0)
        return lang === "en" ? "Contact for price" : "Giá liên hệ";
    return lang === "en"
        ? `$${(numericPrice / 23000).toFixed(2)}`
        : numericPrice.toLocaleString("vi-VN") + "₫";
}
