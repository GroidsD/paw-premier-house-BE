const FALLBACK_REPLY = {
    vi: {
        default:
            "Xin lỗi, hiện tại mình chưa có đủ thông tin để trả lời chính xác.",
        products:
            "Mình đã tìm được một số sản phẩm phù hợp. Bạn có thể xem các gợi ý bên dưới.",
        services:
            "Mình đã tìm được một số dịch vụ phù hợp. Bạn có thể xem các gợi ý bên dưới.",
        bookings: "Mình đã tìm thấy thông tin booking phù hợp của bạn.",
        orders: "Mình đã tìm thấy thông tin đơn hàng phù hợp của bạn.",
        auth_required: "Bạn cần đăng nhập để xem dữ liệu cá nhân của mình.",
        general:
            "Mình có thể hỗ trợ bạn tìm sản phẩm, dịch vụ, booking hoặc đơn hàng.",
    },
    en: {
        default:
            "Sorry, I do not have enough information to answer accurately right now.",
        products:
            "I found some suitable products for you. Please check the suggestions below.",
        services:
            "I found some suitable services for you. Please check the suggestions below.",
        bookings: "I found your relevant booking information.",
        orders: "I found your relevant order information.",
        auth_required: "Please log in to view your personal data.",
        general: "I can help you find products, services, bookings, or orders.",
    },
};

const ACTION_LABELS = {
    vi: {
        product: "Xem chi tiết",
        service: "Xem dịch vụ",
        booking: "Xem booking",
        order: "Xem đơn hàng",
        login: "Đăng nhập",
        book_now: "Đặt lịch ngay",
    },
    en: {
        product: "View details",
        service: "View service",
        booking: "View booking",
        order: "View order",
        login: "Log in",
        book_now: "Book now",
    },
};

module.exports = {
    FALLBACK_REPLY,
    ACTION_LABELS,
};
