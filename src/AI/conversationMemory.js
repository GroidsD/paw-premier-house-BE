

class ConversationMemory {
    constructor(maxHistory = 10) {
        this.conversations = new Map(); 
        this.maxHistory = maxHistory;
    }

    
    addMessage(userId, role, content) {
        if (!this.conversations.has(userId)) {
            this.conversations.set(userId, []);
        }

        const messages = this.conversations.get(userId);
        messages.push({
            role, 
            content,
            timestamp: new Date(),
        });

        
        if (messages.length > this.maxHistory) {
            messages.shift();
        }
    }

    
    getHistory(userId, limit = 5) {
        const messages = this.conversations.get(userId) || [];
        return messages.slice(-limit);
    }

    
    getContextSummary(userId) {
        const history = this.getHistory(userId);
        if (history.length === 0) return null;

        return history.map(h => `${h.role}: ${h.content}`).join('\n');
    }

    
    clearHistory(userId) {
        this.conversations.delete(userId);
    }

    
    analyzeUserIntent(userId) {
        const history = this.getHistory(userId);
        const analysis = {
            interests: [], 
            serviceInterests: [], 
            priceRange: null,
            petType: null,
        };

        for (const msg of history) {
            if (msg.role !== 'user') continue;

            const text = msg.content.toLowerCase();

            
            if (/(mèo|cat)/.test(text)) analysis.petType = 'cat';
            if (/(chó|dog)/.test(text)) analysis.petType = 'dog';

            
            if (/(thức ăn|food)/.test(text)) analysis.interests.push('food');
            if (/(đồ chơi|toy)/.test(text)) analysis.interests.push('toy');
            if (/(phụ kiện|accessory)/.test(text)) analysis.interests.push('accessory');

            
            if (/(spa|tắm|bath)/.test(text)) analysis.serviceInterests.push('spa');
            if (/(groom|cắt tỉa|trim)/.test(text)) analysis.serviceInterests.push('grooming');
            if (/(khách sạn|hotel|boarding|lưu trú)/.test(text)) analysis.serviceInterests.push('hotel');
            if (/(huấn luyện|training|coach)/.test(text)) analysis.serviceInterests.push('training');

            
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


const conversationMemory = new ConversationMemory();

export default conversationMemory;
