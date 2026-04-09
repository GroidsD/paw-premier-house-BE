const formatResponse = ({ intent, rawReply, context }) => {
    let cards = [];
    let suggestions = [];

    if (context?.type === "products") {
        cards = (context.items || []).map((item) => ({
            type: "product",
            id: item.product_id,
            name: item.name,
            price: item.price,
            has_variants: item.has_variants,
            quantity: item.quantity,
        }));

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
            price: item.price,
            duration: item.duration,
        }));

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
        }));

        suggestions = [
            "Booking gần nhất của tôi",
            "Lịch check-in của tôi",
            "Dịch vụ đã đặt",
        ];
    }

    return {
        intent,
        reply: rawReply,
        cards,
        suggestions,
    };
};

module.exports = formatResponse;
