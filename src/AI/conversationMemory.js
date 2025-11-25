/**
 * Conversation Memory Manager
 * Quản lý lịch sử chat để AI có context
 */

class ConversationMemory {
    constructor(maxHistory = 10) {
        this.conversations = new Map(); // userId -> messages[]
        this.maxHistory = maxHistory;
    }

    /**
     * Thêm message vào lịch sử
     */
    addMessage(userId, role, content) {
        if (!this.conversations.has(userId)) {
            this.conversations.set(userId, []);
        }

        const messages = this.conversations.get(userId);
        messages.push({
            role, // 'user' or 'assistant'
            content,
            timestamp: new Date(),
        });

        // Giữ tối đa maxHistory messages
        if (messages.length > this.maxHistory) {
            messages.shift();
        }
    }

    /**
     * Lấy lịch sử chat
     */
    getHistory(userId, limit = 5) {
        const messages = this.conversations.get(userId) || [];
        return messages.slice(-limit);
    }

    /**
     * Lấy context summary cho GPT
     */
    getContextSummary(userId) {
        const history = this.getHistory(userId);
        if (history.length === 0) return null;

        return history.map(h => `${h.role}: ${h.content}`).join('\n');
    }

    /**
     * Clear lịch sử
     */
    clearHistory(userId) {
        this.conversations.delete(userId);
    }

    /**
     * Phân tích intent từ lịch sử
     */
    analyzeUserIntent(userId) {
        const history = this.getHistory(userId);
        const analysis = {
            interests: [], // Sản phẩm/category user quan tâm
            priceRange: null,
            petType: null,
        };

        for (const msg of history) {
            if (msg.role !== 'user') continue;

            const text = msg.content.toLowerCase();

            // Detect pet type
            if (/(mèo|cat)/.test(text)) analysis.petType = 'cat';
            if (/(chó|dog)/.test(text)) analysis.petType = 'dog';

            // Detect interests
            if (/(thức ăn|food)/.test(text)) analysis.interests.push('food');
            if (/(đồ chơi|toy)/.test(text)) analysis.interests.push('toy');
            if (/(phụ kiện|accessory)/.test(text)) analysis.interests.push('accessory');

            // Detect price range
            const priceMatch = text.match(/(\d+)k?\s*(đến|to|-)\s*(\d+)k?/);
            if (priceMatch) {
                analysis.priceRange = {
                    min: parseInt(priceMatch[1]) * 1000,
                    max: parseInt(priceMatch[3]) * 1000,
                };
            }
        }

        return analysis;
    }
}

// Singleton instance
const conversationMemory = new ConversationMemory();

export default conversationMemory;
