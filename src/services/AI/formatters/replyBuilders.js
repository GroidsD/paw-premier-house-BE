const { getFallbackReply, getFormLabel } = require("./utils");

const buildProductReply = ({ items = [], language = "vi", context = {} }) => {
    const first = items[0];
    const count = items.length;
    const analysis = context?.analysis || {};
    const formLabel = getFormLabel(analysis.productForm, language);

    if (!count) {
        return getFallbackReply(language, "products");
    }

    if (language === "en") {
        if (analysis.discountMode === "discounted" && formLabel) {
            return `I found ${count} discounted ${formLabel} product${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first product"} below.`;
        }

        if (analysis.discountMode === "discounted") {
            return `I found ${count} discounted product${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first product"} below.`;
        }

        if (analysis.discountMode === "non_discounted" && formLabel) {
            return `I found ${count} non-discounted ${formLabel} product${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first product"} below.`;
        }

        if (analysis.discountMode === "non_discounted") {
            return `I found ${count} non-discounted product${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first product"} below.`;
        }

        if (formLabel) {
            return `I found ${count} matching ${formLabel} product${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first product"} below.`;
        }

        return `I found ${count} matching product${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first product"} below.`;
    }

    if (analysis.discountMode === "discounted" && formLabel) {
        return `Mình tìm thấy ${count} sản phẩm ${formLabel} đang giảm giá. Nổi bật nhất là ${first?.name || "sản phẩm đầu tiên"} ở bên dưới.`;
    }

    if (analysis.discountMode === "discounted") {
        return `Mình tìm thấy ${count} sản phẩm đang giảm giá. Nổi bật nhất là ${first?.name || "sản phẩm đầu tiên"} ở bên dưới.`;
    }

    if (analysis.discountMode === "non_discounted" && formLabel) {
        return `Mình tìm thấy ${count} sản phẩm ${formLabel} không giảm giá. Nổi bật nhất là ${first?.name || "sản phẩm đầu tiên"} ở bên dưới.`;
    }

    if (analysis.discountMode === "non_discounted") {
        return `Mình tìm thấy ${count} sản phẩm không giảm giá. Nổi bật nhất là ${first?.name || "sản phẩm đầu tiên"} ở bên dưới.`;
    }

    if (formLabel) {
        return `Mình tìm thấy ${count} sản phẩm ${formLabel} phù hợp. Nổi bật nhất là ${first?.name || "sản phẩm đầu tiên"} ở bên dưới.`;
    }

    return `Mình tìm thấy ${count} sản phẩm phù hợp. Nổi bật nhất là ${first?.name || "sản phẩm đầu tiên"} ở bên dưới.`;
};

const buildServiceReply = ({ items = [], language = "vi", intent }) => {
    const first = items[0];
    const count = items.length;

    if (!count) {
        return getFallbackReply(language, "services");
    }

    if (language === "en") {
        if (intent === "service_booking_intent") {
            return `I found ${count} suitable service option${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first service"} below.`;
        }

        return `I found ${count} suitable service${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first service"} below.`;
    }

    if (intent === "service_booking_intent") {
        return `Mình tìm thấy ${count} lựa chọn dịch vụ phù hợp. Nổi bật nhất là ${first?.name || "dịch vụ đầu tiên"} ở bên dưới.`;
    }

    return `Mình tìm thấy ${count} dịch vụ phù hợp. Nổi bật nhất là ${first?.name || "dịch vụ đầu tiên"} ở bên dưới.`;
};

const buildBookingReply = ({ items = [], language = "vi" }) => {
    if (!items.length) {
        return getFallbackReply(language, "bookings");
    }

    if (language === "en") {
        return `I found ${items.length} booking record${items.length > 1 ? "s" : ""} for you.`;
    }

    return `Mình tìm thấy ${items.length} booking phù hợp cho bạn.`;
};

const buildOrderReply = ({ items = [], language = "vi" }) => {
    if (!items.length) {
        return getFallbackReply(language, "orders");
    }

    if (language === "en") {
        return `I found ${items.length} order record${items.length > 1 ? "s" : ""} for you.`;
    }

    return `Mình tìm thấy ${items.length} đơn hàng phù hợp cho bạn.`;
};

module.exports = {
    buildProductReply,
    buildServiceReply,
    buildBookingReply,
    buildOrderReply,
};
