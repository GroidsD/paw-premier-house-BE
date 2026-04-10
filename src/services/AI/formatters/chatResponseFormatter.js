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

const pickLanguage = (analysis, context) =>
    analysis?.language || context?.analysis?.language || "vi";

const getFallbackReply = (language, contextType) =>
    FALLBACK_REPLY[language]?.[contextType] ||
    FALLBACK_REPLY[language]?.default ||
    FALLBACK_REPLY.vi.default;

const getActionLabel = (language, type) =>
    ACTION_LABELS[language]?.[type] || ACTION_LABELS.vi[type];

const truncateText = (text = "", maxLength = 90) => {
    const value = String(text || "").trim();
    if (!value) return "";
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength).trim()}...`;
};

const calcDiscountPercent = (price, originalPrice) => {
    const current = Number(price || 0);
    const original = Number(originalPrice || 0);

    if (!original || original <= current) return 0;

    return Math.round(((original - current) / original) * 100);
};

const getStockStatus = (quantity) =>
    Number(quantity || 0) > 0 ? "in_stock" : "out_of_stock";

const sanitizeReplyText = (text = "") => {
    const value = String(text || "").trim();
    if (!value) return "";

    return value
        .replace(/!\[.*?\]\((.*?)\)/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const getFormLabel = (productForm, language = "vi") => {
    const map = {
        vi: {
            pate: "pate",
            kibble: "hạt",
            milk: "sữa",
            toy: "đồ chơi",
            snack: "snack",
            shampoo: "sữa tắm",
        },
        en: {
            pate: "pate",
            kibble: "kibble",
            milk: "milk",
            toy: "toy",
            snack: "snack",
            shampoo: "shampoo",
        },
    };

    return map[language]?.[productForm] || productForm || "";
};

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

const getSuggestionsByContext = ({
    language,
    contextType,
    isLoggedIn,
    intent,
    context,
}) => {
    const analysis = context?.analysis || {};
    const petType = analysis.petType || null;
    const discountMode = analysis.discountMode || null;
    const productForm = analysis.productForm || null;

    if (contextType === "auth_required") {
        return language === "en"
            ? ["Log in", "Dog products", "Grooming services"]
            : ["Đăng nhập", "Sản phẩm cho chó", "Dịch vụ grooming"];
    }

    if (contextType === "products") {
        if (language === "en") {
            if (petType === "cat" && productForm === "pate") {
                return ["Cat pate", "Cat food", "Discounted products"];
            }
            if (petType === "cat" && productForm === "kibble") {
                return ["Cat kibble", "Cat pate", "Discounted products"];
            }
            if (petType === "cat" && productForm === "milk") {
                return ["Kitten milk", "Cat food", "Discounted products"];
            }
            if (petType === "cat" && productForm === "toy") {
                return ["Cat toys", "Cat food", "Discounted products"];
            }

            if (petType === "dog" && productForm === "pate") {
                return ["Dog pate", "Dog food", "Discounted products"];
            }
            if (petType === "dog" && productForm === "kibble") {
                return ["Dog kibble", "Dog food", "Discounted products"];
            }
            if (petType === "dog" && productForm === "milk") {
                return ["Puppy milk", "Dog food", "Discounted products"];
            }
            if (petType === "dog" && productForm === "toy") {
                return ["Dog toys", "Dog food", "Discounted products"];
            }

            if (discountMode === "discounted") {
                return petType === "cat"
                    ? ["Cat food on sale", "Cat products", "My orders"]
                    : petType === "dog"
                      ? ["Dog food on sale", "Dog products", "My orders"]
                      : ["Discounted products", "Cat products", "Dog products"];
            }

            if (discountMode === "non_discounted") {
                return petType === "cat"
                    ? ["Cat food", "Full price cat food", "My orders"]
                    : petType === "dog"
                      ? ["Dog food", "Full price dog food", "My orders"]
                      : [
                            "Non-discounted products",
                            "Cat products",
                            "Dog products",
                        ];
            }

            if (petType === "cat") {
                return isLoggedIn
                    ? ["Cat food", "Discounted products", "My orders"]
                    : ["Cat food", "Cat pate", "Discounted products"];
            }

            if (petType === "dog") {
                return isLoggedIn
                    ? ["Dog food", "Discounted products", "My orders"]
                    : ["Dog food", "Dog products", "Discounted products"];
            }

            return isLoggedIn
                ? ["Buy now", "My orders", "Recommended products"]
                : ["Dog products", "Cat products", "Discounted products"];
        }

        if (petType === "cat" && productForm === "pate") {
            return ["Pate cho mèo", "Hạt cho mèo", "Sản phẩm giảm giá"];
        }
        if (petType === "cat" && productForm === "kibble") {
            return ["Hạt cho mèo", "Pate cho mèo", "Sản phẩm giảm giá"];
        }
        if (petType === "cat" && productForm === "milk") {
            return ["Sữa cho mèo con", "Pate cho mèo", "Sản phẩm giảm giá"];
        }
        if (petType === "cat" && productForm === "toy") {
            return ["Đồ chơi cho mèo", "Pate cho mèo", "Sản phẩm giảm giá"];
        }

        if (petType === "dog" && productForm === "pate") {
            return ["Pate cho chó", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }
        if (petType === "dog" && productForm === "kibble") {
            return ["Hạt cho chó", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }
        if (petType === "dog" && productForm === "milk") {
            return ["Sữa cho chó con", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }
        if (petType === "dog" && productForm === "toy") {
            return ["Đồ chơi cho chó", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }

        if (discountMode === "discounted") {
            return petType === "cat"
                ? ["Pate cho mèo", "Hạt cho mèo", "Đơn hàng của tôi"]
                : petType === "dog"
                  ? ["Thức ăn cho chó", "Sản phẩm cho chó", "Đơn hàng của tôi"]
                  : [
                        "Sản phẩm giảm giá",
                        "Sản phẩm cho mèo",
                        "Sản phẩm cho chó",
                    ];
        }

        if (discountMode === "non_discounted") {
            return petType === "cat"
                ? ["Pate cho mèo giá gốc", "Hạt cho mèo", "Đơn hàng của tôi"]
                : petType === "dog"
                  ? [
                        "Thức ăn cho chó giá gốc",
                        "Sản phẩm cho chó",
                        "Đơn hàng của tôi",
                    ]
                  : [
                        "Sản phẩm không giảm giá",
                        "Sản phẩm cho mèo",
                        "Sản phẩm cho chó",
                    ];
        }

        if (petType === "cat") {
            return isLoggedIn
                ? ["Pate cho mèo", "Hạt cho mèo", "Đơn hàng của tôi"]
                : ["Pate cho mèo", "Hạt cho mèo", "Sản phẩm giảm giá"];
        }

        if (petType === "dog") {
            return isLoggedIn
                ? ["Thức ăn cho chó", "Sản phẩm cho chó", "Đơn hàng của tôi"]
                : ["Thức ăn cho chó", "Sản phẩm cho chó", "Sản phẩm giảm giá"];
        }

        return isLoggedIn
            ? ["Mua ngay", "Đơn hàng của tôi", "Gợi ý cho tôi"]
            : ["Sản phẩm cho chó", "Sản phẩm cho mèo", "Sản phẩm giảm giá"];
    }

    if (contextType === "services") {
        if (intent === "service_booking_intent") {
            return isLoggedIn
                ? language === "en"
                    ? ["Book now", "My bookings", "Spa services"]
                    : ["Đặt lịch ngay", "Booking của tôi", "Dịch vụ spa"]
                : language === "en"
                  ? ["Log in to book", "Grooming services", "Pet hotel"]
                  : [
                        "Đăng nhập để đặt lịch",
                        "Dịch vụ grooming",
                        "Khách sạn thú cưng",
                    ];
        }

        return isLoggedIn
            ? language === "en"
                ? ["Book grooming", "My bookings", "Pet hotel"]
                : ["Đặt grooming", "Booking của tôi", "Khách sạn thú cưng"]
            : language === "en"
              ? ["Grooming services", "Pet spa", "Pet hotel"]
              : ["Dịch vụ grooming", "Spa thú cưng", "Khách sạn thú cưng"];
    }

    if (contextType === "bookings") {
        return language === "en"
            ? ["My latest booking", "Book again", "Services"]
            : ["Booking gần nhất", "Đặt lại", "Xem dịch vụ"];
    }

    if (contextType === "orders") {
        return language === "en"
            ? ["My recent orders", "Buy again", "Products"]
            : ["Đơn hàng gần nhất", "Mua lại", "Xem sản phẩm"];
    }

    return language === "en"
        ? ["Dog products", "Services", "My bookings"]
        : ["Sản phẩm cho chó", "Dịch vụ", "Booking của tôi"];
};

const formatResponse = ({
    intent,
    rawReply,
    context,
    analysis,
    currentUser,
}) => {
    const language = pickLanguage(analysis, context);
    const isLoggedIn = Boolean(currentUser?.user_id);
    const safeRawReply = sanitizeReplyText(rawReply);
    let cards = [];
    let reply = getFallbackReply(language, context?.type);
    let suggestions = getSuggestionsByContext({
        language,
        contextType: context?.type,
        isLoggedIn,
        intent,
        context,
    });

    if (context?.type === "products") {
        cards = (context.items || []).map((item, index) => {
            const matchedVariant = item.matched_variant || null;
            const displayPrice = Number(item.price || 0);
            const displayOriginalPrice = Number(item.original_price || 0);

            const isDiscounted = displayOriginalPrice > displayPrice;
            const discountPercent = calcDiscountPercent(
                displayPrice,
                displayOriginalPrice,
            );

            return {
                type: "product",
                id: item.product_id,
                name: item.name,
                description: item.description || "",
                short_description: truncateText(item.description || "", 88),
                category: item.category || null,
                slug: item.slug || null,
                price: displayPrice,
                original_price: displayOriginalPrice,
                price_min: item.price_min,
                price_max: item.price_max,
                has_variants: item.has_variants,
                is_single_product: !item.has_variants,
                quantity: item.quantity,
                stock_status: getStockStatus(item.quantity),
                image: item.image || null,

                matched_variant: item.has_variants ? matchedVariant : null,
                variants: item.has_variants ? item.variants || [] : [],
                matched_variants: item.has_variants
                    ? item.matched_variants || []
                    : [],
                all_variants_count: item.has_variants
                    ? item.all_variants_count || 0
                    : 0,
                matched_variants_count: item.has_variants
                    ? item.matched_variants_count || 0
                    : 0,

                has_discounted_variants: item.has_variants
                    ? Boolean(item.has_discounted_variants)
                    : false,
                has_non_discounted_variants: item.has_variants
                    ? Boolean(item.has_non_discounted_variants)
                    : false,
                has_mixed_discount_variants: item.has_variants
                    ? Boolean(item.has_mixed_discount_variants)
                    : false,

                is_best_match: index === 0,
                is_discounted: isDiscounted,
                discount_percent: discountPercent,

                badge:
                    index === 0
                        ? language === "en"
                            ? "Best match"
                            : "Phù hợp nhất"
                        : isDiscounted
                          ? language === "en"
                              ? `-${discountPercent}%`
                              : `Giảm ${discountPercent}%`
                          : null,

                action_url: item.slug
                    ? `/shop/${item.slug}`
                    : `/shop/${item.product_id}`,
                action_label: getActionLabel(language, "product"),
            };
        });

        reply = buildProductReply({
            items: context.items || [],
            language,
            context,
        });
    } else if (context?.type === "services") {
        cards = (context.items || []).map((item, index) => ({
            type: "service",
            id: item.service_id,
            name: item.name,
            description: item.description || "",
            short_description: truncateText(item.description || "", 88),
            category: item.category || null,
            price: item.price,
            duration: item.duration,
            image: item.image || null,
            is_best_match: index === 0,
            badge:
                index === 0
                    ? language === "en"
                        ? "Best match"
                        : "Phù hợp nhất"
                    : null,
            action_url: `/service/${item.service_id}`,
            action_label:
                intent === "service_booking_intent"
                    ? getActionLabel(language, "book_now")
                    : getActionLabel(language, "service"),
        }));

        reply = buildServiceReply({
            items: context.items || [],
            language,
            intent,
        });
    } else if (context?.type === "bookings") {
        cards = (context.items || []).map((item, index) => ({
            type: "booking",
            id: item.booking_id,
            booking_code: item.booking_code,
            status: item.status,
            date: item.date,
            check_in: item.check_in,
            check_out: item.check_out,
            total_price: item.total_price,
            is_best_match: index === 0,
            badge:
                index === 0
                    ? language === "en"
                        ? "Latest"
                        : "Gần nhất"
                    : null,
            action_url: `/profile/bookings/${item.booking_id}`,
            action_label: getActionLabel(language, "booking"),
        }));

        reply = buildBookingReply({
            items: context.items || [],
            language,
        });
    } else if (context?.type === "orders") {
        cards = (context.items || []).map((item, index) => ({
            type: "order",
            id: item.order_id,
            order_code: item.order_code,
            status: item.status,
            total_price: item.total_price,
            created_at: item.created_at,
            items: item.items || [],
            item_count: item.item_count || 0,
            preview_image: item.preview_image || null,
            is_best_match: index === 0,
            badge:
                index === 0
                    ? language === "en"
                        ? "Latest"
                        : "Gần nhất"
                    : null,
            action_url: `/profile/orders/${item.order_id}`,
            action_label: getActionLabel(language, "order"),
        }));

        reply = buildOrderReply({
            items: context.items || [],
            language,
        });
    } else if (context?.type === "auth_required") {
        cards = [
            {
                type: "auth_cta",
                id: "login_required",
                title:
                    language === "en"
                        ? "Log in to view your personal data"
                        : "Đăng nhập để xem dữ liệu cá nhân",
                description:
                    context?.reply ||
                    getFallbackReply(language, "auth_required"),
                short_description:
                    context?.reply ||
                    getFallbackReply(language, "auth_required"),
                badge: language === "en" ? "Login required" : "Cần đăng nhập",
                action_url: "/login",
                action_label: getActionLabel(language, "login"),
            },
        ];

        reply =
            context?.reply ||
            safeRawReply ||
            getFallbackReply(language, "auth_required");
    } else {
        reply =
            safeRawReply ||
            getFallbackReply(language, context?.type || "default");
    }

    if (!(context?.items || []).length && context?.type !== "auth_required") {
        reply =
            safeRawReply ||
            getFallbackReply(language, context?.type || "default");
    }

    return {
        intent,
        reply,
        cards,
        suggestions,
        meta: {
            language,
            isLoggedIn,
            confidence: context?.confidence ?? 0,
            matched_categories: context?.matched_categories || [],
            applied_filters: context?.applied_filters || [],
            context_type: context?.type || "general",
            product_form: context?.analysis?.productForm || null,
            discount_mode: context?.analysis?.discountMode || null,
        },
    };
};

module.exports = formatResponse;
