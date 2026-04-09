const formatProductReply = (items = [], userQuestion = "") => {
    if (!items.length) {
        return "Hiện tại mình chưa tìm thấy sản phẩm phù hợp. Bạn thử nói rõ hơn như thức ăn cho chó nhỏ, pate cho chó, hoặc hạt cho chó con nhé.";
    }

    const first = items[0];
    const count = items.length;

    return `Mình tìm thấy ${count} sản phẩm phù hợp. Nổi bật nhất là ${first.name}. Bạn có thể xem nhanh các sản phẩm bên dưới.`;
};
const formatResponse = ({ intent, rawReply, context }) => {
    let cards = [];
    let suggestions = [];
    let reply = rawReply;

    if (context?.type === "products") {
        cards = (context.items || []).map((item) => ({
            type: "product",
            id: item.product_id,
            name: item.name,
            description: item.description || "",
            category: item.category || null,
            slug: item.slug || null,
            price: item.price,
            original_price: item.original_price,
            has_variants: item.has_variants,
            quantity: item.quantity,
            image: item.image || null,
            variants: item.variants || [],
            action_url: item.slug
                ? `/shop/${item.slug}`
                : `/shop/${item.product_id}`,
            action_label: "Xem chi tiết",
        }));
        reply = formatProductReply(context.items, context.user_question);
        suggestions = [
            "Xem sản phẩm đang giảm giá",
            "Sản phẩm cho chó nhỏ",
            "Sản phẩm còn hàng",
        ];
    }

    if (context?.type === "services") {
        cards = (context.items || []).map((item) => ({
            type: "service",
            id: item.service_id,
            name: item.name,
            description: item.description || "",
            category: item.category || null,
            price: item.price,
            duration: item.duration,
            image: item.image || null,
            action_url: `/service/${item.service_id}`,
            action_label: "Xem dịch vụ",
        }));
        reply = formatProductReply(context.items, context.user_question);
        suggestions = [
            "Xem dịch vụ grooming",
            "Xem dịch vụ spa",
            "Đặt lịch ngay",
        ];
    }

    if (context?.type === "bookings") {
        cards = (context.items || []).map((item) => ({
            type: "booking",
            id: item.booking_id,
            booking_code: item.booking_code,
            status: item.status,
            date: item.date,
            check_in: item.check_in,
            check_out: item.check_out,
            total_price: item.total_price,
            action_url: `/profile/bookings/${item.booking_id}`,
            action_label: "Xem booking",
        }));
        reply = formatProductReply(context.items, context.user_question);
        suggestions = [
            "Booking gần nhất của tôi",
            "Lịch check-in của tôi",
            "Dịch vụ đã đặt",
        ];
    }

    return {
        intent,
        reply,
        cards,
        suggestions,
    };
};

module.exports = formatResponse;
