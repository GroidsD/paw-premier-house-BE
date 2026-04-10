const {
    pickLanguage,
    getFallbackReply,
    getActionLabel,
    truncateText,
    calcDiscountPercent,
    getStockStatus,
    sanitizeReplyText,
} = require("./utils");
const {
    buildProductReply,
    buildServiceReply,
    buildBookingReply,
    buildOrderReply,
} = require("./replyBuilders");
const { getSuggestionsByContext } = require("./suggestionBuilder");

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
