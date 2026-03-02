const buildUrlEmail = (type, id, token) => {
    const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";

    switch (type) {
        case "booking":
            return `${baseUrl}/verify-booking?bookingId=${id}&token=${token}`;
        case "order":
            return `${baseUrl}/verify-order?orderId=${id}&token=${token}`;
        default:
            return baseUrl;
    }
};

module.exports = buildUrlEmail;
