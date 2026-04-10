const FALLBACK_REPLY = {
    vi: {
        default: "Xin loi, hien tai minh chua co du thong tin de tra loi chinh xac.",
        products:
            "Hien tai minh chua tim thay san pham phu hop. Ban co the mo ta ro hon nhu muc dich, loai thu cung, hoac kich co.",
        services:
            "Hien tai minh chua tim thay dich vu phu hop. Ban co the mo ta ro hon nhu grooming, spa, hotel hay training.",
        bookings: "Minh chua tim thay booking phu hop trong du lieu hien co.",
    },
    en: {
        default: "Sorry, I do not have enough information to answer accurately right now.",
        products:
            "I could not find a suitable product yet. Please describe the goal, pet type, or size more clearly.",
        services:
            "I could not find a suitable service yet. Please specify grooming, spa, hotel, or training.",
        bookings: "I could not find a matching booking in the current data.",
    },
};

const SUGGESTIONS = {
    vi: {
        products: [
            "San pham dang giam gia",
            "San pham cho cho nho",
            "San pham con hang",
        ],
        services: [
            "Xem dich vu grooming",
            "Xem dich vu spa",
            "Dat lich ngay",
        ],
        bookings: [
            "Booking gan nhat cua toi",
            "Lich check-in cua toi",
            "Dich vu da dat",
        ],
        default: ["Tim san pham cho cho", "Xem dich vu spa", "Kiem tra booking"],
    },
    en: {
        products: [
            "Show discounted products",
            "Products for small dogs",
            "Products in stock",
        ],
        services: [
            "Show grooming services",
            "Show spa services",
            "Book a service",
        ],
        bookings: [
            "My latest booking",
            "My check-in schedule",
            "My booked services",
        ],
        default: ["Find dog products", "Show spa services", "Check my booking"],
    },
};

const ACTION_LABELS = {
    vi: {
        product: "Xem chi tiet",
        service: "Xem dich vu",
        booking: "Xem booking",
    },
    en: {
        product: "View details",
        service: "View service",
        booking: "View booking",
    },
};

const pickLanguage = (analysis, context) =>
    analysis?.language || context?.analysis?.language || "vi";

const getFallbackReply = (language, contextType) =>
    FALLBACK_REPLY[language]?.[contextType] ||
    FALLBACK_REPLY[language]?.default ||
    FALLBACK_REPLY.vi.default;

const getSuggestions = (language, contextType) =>
    SUGGESTIONS[language]?.[contextType] ||
    SUGGESTIONS[language]?.default ||
    SUGGESTIONS.vi.default;

const getActionLabel = (language, type) =>
    ACTION_LABELS[language]?.[type] || ACTION_LABELS.vi[type];

const formatResponse = ({ intent, rawReply, context, analysis }) => {
    let cards = [];
    const language = pickLanguage(analysis, context);
    let suggestions = getSuggestions(language, context?.type);
    let reply = rawReply || getFallbackReply(language, context?.type);

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
            action_label: getActionLabel(language, "product"),
        }));
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
            action_label: getActionLabel(language, "service"),
        }));
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
            action_label: getActionLabel(language, "booking"),
        }));
    }

    if (!rawReply && !(context?.items || []).length) {
        reply = getFallbackReply(language, context?.type);
    }

    return {
        intent,
        reply,
        cards,
        suggestions,
        meta: {
            language,
            confidence: context?.confidence ?? 0,
            matched_categories: context?.matched_categories || [],
            applied_filters: context?.applied_filters || [],
        },
    };
};

module.exports = formatResponse;
