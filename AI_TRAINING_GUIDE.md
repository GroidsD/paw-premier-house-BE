# 🤖 Hướng dẫn Train lại AI Chatbot

## 📋 Tổng quan các cải tiến

### 1. **Intent Classification nâng cao**
- ✅ Thêm context từ lịch sử chat
- ✅ Entity extraction (category, pet_type, price_range, product_name)
- ✅ Fallback logic mạnh hơn với regex
- ✅ Hỗ trợ nhiều intent mới: greeting, price_range, compare, category_browse

### 2. **Semantic Search cải thiện**
- ✅ Query expansion với synonyms
- ✅ Filtering theo entities (category, pet_type, price_range)
- ✅ Similarity scoring
- ✅ Threshold điều chỉnh động (0.5 → 0.3 nếu không có kết quả)

### 3. **Conversation Memory**
- ✅ Lưu lịch sử chat (tối đa 10 messages)
- ✅ Phân tích user profile (interests, petType, priceRange)
- ✅ Context-aware responses

### 4. **Recommendation nâng cao**
- ✅ Loại bỏ sản phẩm đã mua
- ✅ Ưu tiên sản phẩm bán chạy + mới
- ✅ Sử dụng user profile từ conversation memory
- ✅ Multi-level fallback strategy

### 5. **Rich Embeddings**
- ✅ Metadata phong phú (tags, popularity, stock status)
- ✅ Thêm sold, stock, rating vào vectors
- ✅ Smart tagging (bestseller, sale, premium, etc.)

---

## 🔧 Các bước Train lại AI

### **Bước 1: Cập nhật Supabase Schema**

Trước tiên, cần thêm các cột mới vào bảng `product_vectors`:

```sql
-- Thêm các cột metadata
ALTER TABLE product_vectors 
ADD COLUMN IF NOT EXISTS sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;

-- Thêm index để tăng tốc query
CREATE INDEX IF NOT EXISTS idx_product_vectors_sold ON product_vectors(sold DESC);
CREATE INDEX IF NOT EXISTS idx_product_vectors_category ON product_vectors(category);
```

### **Bước 2: Re-embed tất cả sản phẩm**

Chạy script để tạo lại embeddings với metadata mới:

```bash
# Từ thư mục gốc của project
node src/scripts/embedProducts.js
```

**Lưu ý:** 
- Script sẽ mất 5-10 phút tùy số lượng sản phẩm
- Cần có OPENAI_API_KEY và SUPABASE credentials trong .env
- Mỗi sản phẩm sẽ có 2 embeddings (vi + en)

### **Bước 3: Test các intent mới**

Test chatbot với các câu hỏi sau:

#### **Greeting:**
- "Xin chào"
- "Hello"
- "Hi"

#### **Product Search với entities:**
- "Tìm thức ăn cho mèo" → category=food, pet_type=cat
- "Đồ chơi cho chó" → category=toy, pet_type=dog
- "Phụ kiện cho thú cưng" → category=accessory

#### **Price Range:**
- "Sản phẩm dưới 100k"
- "Từ 50k đến 200k"
- "Products under 100k"

#### **Conversation Context:**
```
User: "Tôi muốn mua thức ăn cho mèo"
Bot: [Trả về danh sách thức ăn mèo]
User: "Cái nào rẻ nhất?" 
Bot: [Nhớ context là "thức ăn mèo", trả về thức ăn mèo rẻ nhất]
```

### **Bước 4: Monitor logs**

Khi test, xem logs để kiểm tra:

```javascript
console.log("🧭 Intent:", intent, "| Entities:", entities, "| Lang:", userLang);
console.log("👤 User profile:", userProfile);
console.log("🔍 Expanded query:", expandedQuery);
```

---

## 🎯 Cách tối ưu thêm

### **1. Fine-tune Intent Classification**

Nếu AI vẫn phân loại sai intent, cập nhật prompt trong `classifyIntent.js`:

```javascript
// Thêm examples vào prompt
const prompt = `
...
**Examples:**
- "tìm thức ăn cho mèo" → product_search (category=food, pet_type=cat)
- "giá bao nhiêu" → price_inquiry
- "dưới 100k" → price_range (min=0, max=100000)
...
`;
```

### **2. Cải thiện Query Expansion**

Thêm synonyms vào `semanticSearch.js`:

```javascript
function expandQuery(query, language) {
    // Thêm synonyms cho các từ khóa phổ biến
    const synonyms = {
        "mèo": ["cat", "kitten", "feline", "meow"],
        "chó": ["dog", "puppy", "canine", "woof"],
        // ... thêm nhiều hơn
    };
    
    // Apply synonyms
    for (const [key, values] of Object.entries(synonyms)) {
        if (query.includes(key)) {
            expanded += " " + values.join(" ");
        }
    }
}
```

### **3. Thêm Collaborative Filtering**

Trong `recommendService.js`, thêm logic:

```javascript
// Tìm users tương tự (mua cùng sản phẩm)
const similarUsers = await findSimilarUsers(userId);

// Gợi ý sản phẩm mà similar users đã mua
const recommendations = await getProductsFromSimilarUsers(similarUsers);
```

### **4. A/B Testing**

Test 2 versions:
- Version A: Threshold = 0.5
- Version B: Threshold = 0.7

Xem version nào cho kết quả tốt hơn.

---

## 📊 Metrics để đánh giá

### **1. Intent Accuracy**
```javascript
// Log intent classification results
const correctIntents = 0;
const totalQueries = 0;
const accuracy = correctIntents / totalQueries;
```

### **2. Search Relevance**
- Số lượng queries trả về 0 kết quả
- Average similarity score
- Click-through rate (nếu có tracking)

### **3. Recommendation Quality**
- Conversion rate từ recommendations
- User engagement với recommended products

---

## 🐛 Troubleshooting

### **Vấn đề 1: AI không hiểu câu hỏi**
**Nguyên nhân:** Intent classification sai hoặc entities không được extract đúng

**Giải pháp:**
1. Check logs để xem intent + entities
2. Thêm examples vào prompt
3. Cải thiện fallback regex

### **Vấn đề 2: Kết quả tìm kiếm không liên quan**
**Nguyên nhân:** Embeddings không đủ context hoặc threshold quá thấp

**Giải pháp:**
1. Re-embed với metadata phong phú hơn
2. Tăng threshold lên 0.6-0.7
3. Thêm query expansion

### **Vấn đề 3: AI không nhớ context**
**Nguyên nhân:** Conversation memory không hoạt động

**Giải pháp:**
1. Check userId/sessionId có đúng không
2. Verify conversationMemory.addMessage() được gọi
3. Check history có được truyền vào classifyIntent()

---

## 📝 Checklist sau khi train

- [ ] Chạy embedProducts.js thành công
- [ ] Test greeting intent
- [ ] Test product search với entities
- [ ] Test price range queries
- [ ] Test conversation context (multi-turn)
- [ ] Test recommendation với user profile
- [ ] Monitor logs để verify intent + entities
- [ ] Check Supabase có đủ vectors không

---

## 🚀 Next Steps

1. **Thêm analytics:** Track user queries, intent distribution, search success rate
2. **Fine-tune GPT:** Tạo dataset từ real queries để fine-tune model
3. **Add caching:** Cache frequent queries để giảm latency
4. **Implement feedback loop:** Cho user rate responses để improve model

---

**Chúc bạn train AI thành công! 🎉**

Nếu có vấn đề gì, check logs và troubleshooting guide ở trên nhé!
