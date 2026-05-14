// const axios = require("axios");

// const AI_BASE_URL = process.env.AI_BASE_URL || "http://127.0.0.1:8001";

// const analyze = async ({ message, currentUser }) => {
//     const { data } = await axios.post(`${AI_BASE_URL}/analyze`, {
//         message,
//         currentUser,
//     });
//     return data;
// };

// const generateReply = async ({
//     mode,
//     intent,
//     message,
//     currentUser,
//     context,
//     analysis,
// }) => {
//     const { data } = await axios.post(`${AI_BASE_URL}/reply`, {
//         mode,
//         intent,
//         message,
//         currentUser,
//         context,
//         analysis,
//     });

//     return data?.reply || "";
// };

// module.exports = {
//     analyze,
//     generateReply,
// };

const axios = require("axios");

const AI_BASE_URL = process.env.AI_BASE_URL || "http://127.0.0.1:8001";

const analyze = async ({ message, currentUser }) => {
    try {
        const { data } = await axios.post(
            `${AI_BASE_URL}/analyze`,
            {
                message,
                currentUser,
            },
            { timeout: 15000 },
        ); // Chờ tối đa 15s

        return data;
    } catch (error) {
        console.error(
            "[AI Gateway] Lỗi khi gọi analyze:",
            error.response?.data || error.message,
        );
        return {}; // Trả về object rỗng để không sập luồng Node.js
    }
};

const generateReply = async ({
    mode,
    intent,
    message,
    currentUser,
    context,
    analysis,
}) => {
    try {
        // --- BƯỚC FIX LỖI TOKEN LIMIT: CẮT NGẮN DATA NẾU QUÁ DÀI ---
        // Nếu context chứa knowledge_items, ta kiểm tra độ dài và cắt bớt
        let safeContext = context;
        if (safeContext && Array.isArray(safeContext.knowledge_items)) {
            safeContext.knowledge_items = safeContext.knowledge_items.map(
                (item) => {
                    if (item.content && item.content.length > 1500) {
                        // Giới hạn 1500 ký tự mỗi mục tri thức để tránh AI bị quá tải
                        return {
                            ...item,
                            content: item.content.substring(0, 1500) + "...",
                        };
                    }
                    return item;
                },
            );
        }

        const { data } = await axios.post(
            `${AI_BASE_URL}/reply`,
            {
                mode,
                intent,
                message,
                currentUser,
                context: safeContext, // Đã thay bằng context an toàn
                analysis,
            },
            {
                timeout: 30000, // Cho phép đợi Python tối đa 30s
            },
        );

        return data?.reply || "";
    } catch (error) {
        // In ra log lỗi chi tiết để bạn có thể xem trên Terminal/Console
        console.error("=====================================");
        console.error("[AI Gateway] LỖI KHI GỌI PYTHON API:");
        console.error("Message:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data (Python trả về):", error.response.data);
        }
        console.error("=====================================");

        // Trả về câu thông báo mềm mỏng khi AI bận, thay vì văng lỗi cứng
        return "Xin lỗi, hiện tại khối lượng thông tin hơi lớn nên AI chưa thể tổng hợp được. Bạn có thể hỏi cụ thể hơn được không?";
    }
};

module.exports = {
    analyze,
    generateReply,
};
