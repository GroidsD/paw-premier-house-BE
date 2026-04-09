const buildPrompt = ({ intent, message, currentUser, context }) => {
    const systemPrompt = `
Bạn là AI assistant cho hệ thống pet care.
Nguyên tắc:
- Chỉ trả lời dựa trên dữ liệu context được cung cấp.
- Không tự bịa thêm giá, tồn kho, lịch hẹn hoặc thông tin sản phẩm.
- Nếu dữ liệu không đủ, hãy nói rõ là chưa đủ thông tin.
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn, dễ hiểu.
- Nếu có danh sách sản phẩm hoặc dịch vụ, hãy ưu tiên tóm tắt ngắn và nêu item phù hợp nhất trước.
- Nếu là booking, chỉ mô tả dữ liệu booking của đúng người dùng hiện tại.
`;

    const userContext = {
        user_id: currentUser?.user_id || null,
        fullname: currentUser?.fullname || null,
        email: currentUser?.email || null,
    };

    return `
${systemPrompt}

INTENT:
${intent}

USER:
${JSON.stringify(userContext, null, 2)}

QUESTION:
${message}

CONTEXT:
${JSON.stringify(context, null, 2)}

Hãy tạo câu trả lời phù hợp.
`;
};

module.exports = buildPrompt;
