import openai from "../config/openAI.js";


export async function classifyIntent(text, conversationHistory = []) {
    
    const contextStr = conversationHistory.length > 0
        ? `\nLịch sử chat:\n${conversationHistory.map(h => `- ${h.role}: ${h.content}`).join('\n')}`
        : '';

    const prompt = `
Bạn là bộ phân loại intent cho chatbot e-commerce thú cưng (Pet Sanctuary).

**Danh sách Intent:**
1. "product_search" - Tìm kiếm sản phẩm cụ thể (ví dụ: "tìm thức ăn cho mèo", "có đồ chơi cho chó không")
2. "product_detail" - Hỏi chi tiết về 1 sản phẩm (ví dụ: "sản phẩm này có tốt không", "thành phần gì")
3. "top_selling" - Sản phẩm bán chạy (ví dụ: "sản phẩm nào hot nhất", "best seller")
4. "low_stock" - Sản phẩm sắp hết (ví dụ: "còn ít hàng", "sắp hết")
5. "discounted" - Sản phẩm giảm giá (ví dụ: "đang sale", "khuyến mãi")
6. "recommend" - Gợi ý sản phẩm (ví dụ: "nên mua gì", "gợi ý cho tôi")
7. "price_inquiry" - Hỏi giá (ví dụ: "giá bao nhiêu", "price")
8. "price_range" - Tìm theo khoảng giá (ví dụ: "dưới 100k", "từ 50k đến 200k")
9. "highest_price" - Sản phẩm đắt nhất
10. "lowest_price" - Sản phẩm rẻ nhất
11. "compare" - So sánh sản phẩm (ví dụ: "khác gì nhau", "nên chọn cái nào")
12. "category_browse" - Xem theo danh mục (ví dụ: "có những loại thức ăn nào", "danh mục phụ kiện")
13. "service_search" - Tìm dịch vụ (ví dụ: "dịch vụ tắm cho chó", "pet spa")
14. "service_price" - Hỏi giá dịch vụ (ví dụ: "tắm spa bao nhiêu", "dịch vụ grooming giá")
15. "service_booking" - Đặt lịch dịch vụ (ví dụ: "đặt lịch tắm", "book grooming")
16. "service_recommend" - Gợi ý dịch vụ (ví dụ: "nên chọn dịch vụ nào cho mèo")
17. "greeting" - Chào hỏi (ví dụ: "xin chào", "hello")
18. "other" - Không rõ ràng

**Nhiệm vụ:**
- Phân loại câu hỏi vào 1 intent phù hợp nhất
- Trích xuất entities quan trọng (category, service_category, price_range, product_name, pet_type)
- Đánh giá confidence (0.0 - 1.0)
${contextStr}

**Câu hỏi hiện tại:** """${text}"""

**Output format (JSON only):**
{
  "intent": "...",
  "confidence": 0.0,
  "entities": {
    "category": "food|toy|accessory|null",
    "service_category": "spa|grooming|hotel|training|null",
    "pet_type": "cat|dog|null",
    "price_range": {"min": 0, "max": 0} or null,
    "product_name": "..." or null
  },
  "reasoning": "Giải thích ngắn gọn"
}
`;

    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Bạn là chuyên gia phân loại intent cho chatbot e-commerce." },
                { role: "user", content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.1, 
        });

        const content = res.choices?.[0]?.message?.content ?? "";
        const jsonText = content.trim().match(/\{[\s\S]*\}/)?.[0] ?? content;
        const result = JSON.parse(jsonText);

        console.log("🧭 Intent classification:", result);
        return result;

    } catch (error) {
        console.error("❌ Intent classification error:", error);
        
        return fallbackClassifyIntent(text);
    }
}


function fallbackClassifyIntent(text) {
    const t = text.toLowerCase();
    
    
    if (/(^hi|^hello|^xin chào|^chào|^hey)/.test(t)) {
        return { intent: "greeting", confidence: 0.9, entities: {} };
    }

    
    const priceMatch = t.match(/(dưới|under|below)\s*(\d+)|(\d+)\s*(đến|to|-)\s*(\d+)/);
    if (priceMatch) {
        return { 
            intent: "price_range", 
            confidence: 0.85,
            entities: { 
                price_range: priceMatch[2] 
                    ? { min: 0, max: parseInt(priceMatch[2]) * 1000 }
                    : { min: parseInt(priceMatch[3]) * 1000, max: parseInt(priceMatch[5]) * 1000 }
            }
        };
    }

    
    if (/(giá|bao nhiêu|price|cost)/.test(t)) {
        if (/(mắc nhất|đắt nhất|cao nhất|highest|most expensive)/.test(t))
            return { intent: "highest_price", confidence: 0.9, entities: {} };
        if (/(rẻ nhất|thấp nhất|lowest|cheapest)/.test(t))
            return { intent: "lowest_price", confidence: 0.9, entities: {} };
        return { intent: "price_inquiry", confidence: 0.8, entities: {} };
    }

    
    if (/(bán chạy|hot|best|popular|trending)/.test(t))
        return { intent: "top_selling", confidence: 0.85, entities: {} };

    
    if (/(sắp hết|còn lại|ít hàng|low stock|limited)/.test(t))
        return { intent: "low_stock", confidence: 0.85, entities: {} };

    
    if (/(giảm giá|sale|khuyến mãi|discount|promotion)/.test(t))
        return { intent: "discounted", confidence: 0.85, entities: {} };

    
    if (/(gợi ý|recommend|suggest|nên mua|tư vấn)/.test(t))
        return { intent: "recommend", confidence: 0.8, entities: {} };

    
    if (/(so sánh|compare|khác gì|difference|vs)/.test(t))
        return { intent: "compare", confidence: 0.8, entities: {} };

    
    const entities = {};
    if (/(mèo|cat|kitten)/.test(t)) entities.pet_type = "cat";
    if (/(chó|dog|puppy)/.test(t)) entities.pet_type = "dog";
    if (/(thức ăn|food|eat)/.test(t)) entities.category = "food";
    if (/(đồ chơi|toy|play)/.test(t)) entities.category = "toy";
    if (/(phụ kiện|accessory|collar|leash)/.test(t)) entities.category = "accessory";

    const serviceKeywords = /(dịch vụ|spa|tắm|bath|groom|grooming|khách sạn|hotel|boarding|huấn luyện|training)/;
    if (serviceKeywords.test(t)) {
        entities.service_category = detectServiceCategory(t);

        if (/(giá|bao nhiêu|price|cost)/.test(t)) {
            return { intent: "service_price", confidence: 0.85, entities };
        }

        if (/(đặt lịch|book|booking|schedule|đăng ký)/.test(t)) {
            return { intent: "service_booking", confidence: 0.85, entities };
        }

        if (/(gợi ý|recommend|suggest|nên chọn)/.test(t)) {
            return { intent: "service_recommend", confidence: 0.8, entities };
        }

        return { intent: "service_search", confidence: 0.75, entities };
    }

    
    return { 
        intent: "product_search", 
        confidence: 0.6,
        entities 
    };
}

function detectServiceCategory(text) {
    if (/(spa|tắm|bath)/.test(text)) return "spa";
    if (/(groom|cắt tỉa|trim)/.test(text)) return "grooming";
    if (/(khách sạn|hotel|boarding)/.test(text)) return "hotel";
    if (/(huấn luyện|training|coach)/.test(text)) return "training";
    return null;
}