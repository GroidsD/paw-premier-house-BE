# 🔍 AI System Review & Recommendations

## 📊 Hiện trạng hệ thống

### ✅ **Những gì đã có (GOOD)**

#### 1. **Product AI** ⭐⭐⭐⭐⭐
- ✅ Intent classification (14 intents)
- ✅ Semantic search với embeddings
- ✅ Conversation memory
- ✅ Entity extraction
- ✅ Multi-language support (vi/en)
- ✅ Recommendation engine
- ✅ Price filtering, category filtering

**Đánh giá:** Rất tốt! Đã đủ để trả lời hầu hết câu hỏi về sản phẩm.

---

#### 2. **Database Models** ⭐⭐⭐⭐
Bạn có đầy đủ models:
- ✅ **Product** (sản phẩm)
- ✅ **Service** (dịch vụ)
- ✅ **Order** + **OrderItem** (đơn hàng)
- ✅ **Feedback** (đánh giá cho product/service/pet)
- ✅ **UserRecommendation** (lưu gợi ý)
- ✅ **Booking** + **BookingItem** (đặt lịch dịch vụ)

**Đánh giá:** Models rất đầy đủ và có relationship tốt!

---

### ⚠️ **Những gì còn thiếu (CẦN CẢI THIỆN)**

#### 1. **Service AI** ❌ (CHƯA CÓ)
Hiện tại AI chỉ trả lời về **Products**, chưa có cho **Services**!

**Ví dụ user hỏi:**
- ❌ "Dịch vụ tắm cho chó giá bao nhiêu?"
- ❌ "Có dịch vụ cắt tỉa lông không?"
- ❌ "Gợi ý dịch vụ cho mèo"

→ AI không trả lời được!

---

#### 2. **Feedback Integration** ⚠️ (CHƯA DÙNG)
Bạn có model **Feedback** với:
- `rating` (1-5 sao)
- `content` (nội dung đánh giá)
- `entity_type` (product/service/pet)

Nhưng **chưa dùng trong AI**!

**Lợi ích nếu dùng:**
- ✅ Recommend sản phẩm có rating cao
- ✅ Trả lời "Sản phẩm nào tốt nhất?"
- ✅ Sentiment analysis từ feedback

---

#### 3. **Order History Analysis** ⚠️ (DÙNG CƠ BẢN)
Hiện tại chỉ dùng Order để:
- ✅ Recommend sản phẩm cùng category đã mua

Nhưng **chưa phân tích sâu:**
- ❌ Tần suất mua (user mua thường xuyên → VIP)
- ❌ Seasonal patterns (mùa nào mua nhiều)
- ❌ Cross-selling (mua A thường mua B)

---

#### 4. **UserRecommendation Table** ⚠️ (CHƯA DÙNG)
Bạn có table `UserRecommendations` với:
- `entity_type` (products/services/pets)
- `score` (điểm phù hợp)
- `algorithm_type` (loại thuật toán)

Nhưng **chưa có code nào sử dụng**!

**Lợi ích nếu dùng:**
- ✅ Pre-compute recommendations (nhanh hơn)
- ✅ A/B testing algorithms
- ✅ Track recommendation performance

---

## 🚀 Đề xuất cải tiến

### **Phase 1: Hoàn thiện Product AI** (1-2 tuần)

#### ✅ Đã xong
- [x] Intent classification
- [x] Semantic search
- [x] Conversation memory
- [x] Basic recommendation

#### 🔄 Cần làm thêm
- [ ] **Integrate Feedback vào recommendation**
  ```javascript
  // Ưu tiên sản phẩm có rating cao
  const topRated = await getTopRatedProducts(category, minRating=4.0);
  ```

- [ ] **Advanced Order Analysis**
  ```javascript
  // Phân tích cross-selling
  const frequentlyBoughtTogether = await getFrequentlyBoughtTogether(productId);
  ```

- [ ] **Use UserRecommendation table**
  ```javascript
  // Lưu recommendations để tái sử dụng
  await saveRecommendation(userId, productId, score, reason);
  ```

---

### **Phase 2: Thêm Service AI** (2-3 tuần) ⭐ QUAN TRỌNG

#### Tại sao cần?
Bạn có **Services** trong database nhưng AI không biết!

#### Cần làm gì?

**1. Tạo `embedServices.js`**
```javascript
// Tương tự embedProducts.js
async function embedServices() {
    const services = await db.Service.findAll({
        where: { isActive: true, isDeleted: false },
        include: [
            { model: db.ServiceTranslate, as: "translates" },
            { model: db.ServiceCategory, as: "category" }
        ]
    });

    for (const service of services) {
        // Tạo embedding cho service
        const content = `${service.name}. ${service.description}. 
                        Loại dịch vụ: ${service.category.name}. 
                        Giá: ${service.price} VNĐ.`;
        
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: content
        });

        // Lưu vào Supabase table: service_vectors
        await supabase.from("service_vectors").upsert({
            service_id: service.service_id,
            name: service.name,
            price: service.price,
            content,
            embedding: embedding.data[0].embedding,
            category: service.category.name,
            language: service.language
        });
    }
}
```

**2. Update `classifyIntent.js`**
```javascript
// Thêm intent mới
const intents = [
    ...existingIntents,
    "service_search",      // Tìm dịch vụ
    "service_booking",     // Đặt lịch dịch vụ
    "service_price",       // Hỏi giá dịch vụ
];
```

**3. Tạo `semanticSearchServices.js`**
```javascript
// Tương tự semanticSearchProducts
export async function semanticSearchServices(query, language, topK, filters) {
    // Search trong service_vectors
    const { data } = await supabase.rpc("match_service_vectors", {
        query_embedding: embedding,
        match_count: topK,
        query_lang: language
    });
    return data;
}
```

**4. Update `handleUserQuery.js`**
```javascript
switch (intent) {
    case "service_search":
        response = await handleServiceSearch(text, userLang, entities);
        break;
    
    case "service_booking":
        response = await handleServiceBooking(text, userLang, entities);
        break;
    
    // ... existing cases
}
```

---

### **Phase 3: Advanced Features** (3-4 tuần)

#### 1. **Feedback-based Recommendation**
```javascript
// Recommend dựa trên feedback
async function getTopRatedProducts(category, minRating = 4.0) {
    const feedbacks = await db.Feedback.findAll({
        where: {
            entity_type: "product",
            rating: { [Op.gte]: minRating }
        },
        include: [{ model: db.Product, as: "product" }],
        group: ["entity_id"],
        order: [[sequelize.fn("AVG", sequelize.col("rating")), "DESC"]]
    });
    
    return feedbacks.map(f => f.product);
}
```

#### 2. **Collaborative Filtering**
```javascript
// Tìm users tương tự
async function findSimilarUsers(userId) {
    // Users mua cùng sản phẩm
    const userOrders = await getUserOrders(userId);
    const productIds = userOrders.map(o => o.product_id);
    
    // Tìm users khác cũng mua những sản phẩm này
    const similarUsers = await db.Order.findAll({
        where: {
            product_id: { [Op.in]: productIds },
            customer_id: { [Op.ne]: userId }
        },
        group: ["customer_id"],
        order: [[sequelize.fn("COUNT", "*"), "DESC"]]
    });
    
    return similarUsers;
}

// Recommend sản phẩm mà similar users đã mua
async function collaborativeFiltering(userId) {
    const similarUsers = await findSimilarUsers(userId);
    const recommendations = await getProductsFromUsers(similarUsers);
    return recommendations;
}
```

#### 3. **Pre-compute Recommendations**
```javascript
// Cron job chạy hàng ngày
async function preComputeRecommendations() {
    const users = await db.User.findAll();
    
    for (const user of users) {
        const recommendations = await recommendForUser({
            userId: user.user_id,
            limit: 10
        });
        
        // Lưu vào UserRecommendation table
        for (const rec of recommendations) {
            await db.UserRecommendation.create({
                user_id: user.user_id,
                entity_type: "products",
                entity_id: rec.product_id,
                score: rec.similarity || 0.8,
                recommendation_reason: "Based on purchase history",
                algorithm_type: "collaborative_filtering_v1",
                valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });
        }
    }
}
```

---

## 📋 Roadmap tổng thể

### **Ngay lập tức (Tuần 1-2)**
- [x] ~~Fix product AI bugs~~ ✅ DONE
- [ ] Integrate Feedback vào product recommendation
- [ ] Use UserRecommendation table

### **Ngắn hạn (Tuần 3-5)**
- [ ] Implement Service AI (embedServices + search)
- [ ] Add service booking intent
- [ ] Test service recommendations

### **Trung hạn (Tuần 6-8)**
- [ ] Collaborative filtering
- [ ] Cross-selling analysis
- [ ] Pre-compute recommendations (cron job)

### **Dài hạn (Tuần 9-12)**
- [ ] A/B testing recommendation algorithms
- [ ] Sentiment analysis từ feedback
- [ ] Personalized pricing suggestions
- [ ] Multi-modal search (image + text)

---

## 🎯 Câu trả lời cho câu hỏi của bạn

### **1. "Có nên tách embedProducts ra không?"**

**Đáp án: CÓ! ✅**

**Lý do:**
- Products và Services là 2 entities khác nhau
- Cần 2 tables riêng: `product_vectors` và `service_vectors`
- Dễ maintain và scale

**Cấu trúc đề xuất:**
```
src/scripts/
├── embedProducts.js    # Embed products
├── embedServices.js    # Embed services (NEW)
└── embedAll.js         # Run cả 2 (helper script)
```

---

### **2. "Models đã ổn chưa?"**

**Đáp án: RẤT TỐT! ⭐⭐⭐⭐⭐**

Models của bạn rất đầy đủ:
- ✅ Có Feedback (rating, content)
- ✅ Có UserRecommendation (score, algorithm_type)
- ✅ Có Service + ServiceTranslate
- ✅ Có Order + OrderItem
- ✅ Relationships đúng

**Chỉ cần:**
- Sử dụng chúng trong AI! (hiện tại chưa dùng hết)

---

### **3. "AI đã đủ tốt chưa?"**

**Đáp án: TỐT cho Products, CHƯA CÓ cho Services**

**Products AI:** ⭐⭐⭐⭐⭐ (90/100)
- ✅ Search tốt
- ✅ Recommend tốt
- ✅ Multi-language
- ⚠️ Chưa dùng Feedback
- ⚠️ Chưa có collaborative filtering

**Services AI:** ❌ (0/100)
- ❌ Không có gì cả!
- Cần implement từ đầu

---

## 💡 Kết luận

### **Ưu tiên cao nhất:**
1. **Thêm Service AI** (quan trọng nhất!)
2. Integrate Feedback vào recommendation
3. Use UserRecommendation table

### **Có thể làm sau:**
4. Collaborative filtering
5. Pre-compute recommendations
6. Advanced analytics

---

**Bạn muốn tôi implement Service AI ngay không?** 🚀
