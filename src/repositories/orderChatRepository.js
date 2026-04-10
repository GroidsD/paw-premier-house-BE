const { Op } = require("sequelize");
const { Order, OrderItem } = require("../models");
const normalizeText = require("../utils/normalizeText");

const STATUS_KEYWORDS = {
    pending: ["pending", "cho xac nhan", "đang chờ", "dang cho", "chờ xác nhận"],
    confirmed: ["confirmed", "da xac nhan", "đã xác nhận"],
    shipping: ["shipping", "dang giao", "đang giao", "van chuyen", "vận chuyển"],
    completed: ["completed", "hoan thanh", "hoàn thành", "da nhan", "đã nhận"],
    cancelled: ["cancelled", "canceled", "da huy", "đã huỷ", "huy don", "huỷ đơn"],
};

const includesKeyword = (text = "", keywords = []) => {
    const normalized = normalizeText(text);
    return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
};

const detectOrderStatusFilter = (message = "") => {
    for (const [status, keywords] of Object.entries(STATUS_KEYWORDS)) {
        if (includesKeyword(message, keywords)) {
            return status;
        }
    }
    return null;
};

const detectRecentOnly = (message = "") => {
    const normalized = normalizeText(message);

    return [
        "gan nhat",
        "moi nhat",
        "recent",
        "latest",
        "last order",
        "don gan nhat",
        "don moi nhat",
    ].some((keyword) => normalized.includes(normalizeText(keyword)));
};

const summarizeItems = (items = []) =>
    items.map((item) => ({
        orderItem_id: item.orderItem_id,
        product_id: item.product_id,
        productVariant_id: item.productVariant_id,
        product_name: item.product_name,
        variant_label: item.variant_label || null,
        product_image: item.product_image || null,
        pet_weight: item.pet_weight || null,
        quantity: Number(item.quantity || 0),
        original_price: Number(item.original_price || 0),
        price: Number(item.price || 0),
        total_price: Number(item.total_price || 0),
    }));

const calculateConfidence = (items = []) => {
    if (!items.length) return 0;
    if (items.length === 1) return 0.95;
    if (items.length <= 3) return 0.9;
    return 0.85;
};

const buildAppliedFilters = ({ statusFilter, recentOnly }) => {
    return [
        "customer_scope_only",
        statusFilter ? `status:${statusFilter}` : null,
        recentOnly ? "latest_only" : null,
        "sorted_by_created_at_desc",
    ].filter(Boolean);
};

const findUserOrders = async ({ currentUser, message = "" }) => {
    if (!currentUser?.user_id) {
        return {
            type: "orders",
            items: [],
            reply: "Bạn cần đăng nhập để xem đơn hàng của mình nhé.",
            suggestions: ["Đăng nhập", "Xem sản phẩm", "Dịch vụ grooming"],
            user_question: message,
            confidence: 1,
        };
    }

    const statusFilter = detectOrderStatusFilter(message);
    const recentOnly = detectRecentOnly(message);

    const where = {
        customer_id: currentUser.user_id,
        status: {
            [Op.ne]: "deleted",
        },
    };

    if (statusFilter) {
        where.status = statusFilter;
    }

    const orders = await Order.findAll({
        where,
        include: [
            {
                model: OrderItem,
                as: "orderItems",
                required: false,
                attributes: [
                    "orderItem_id",
                    "product_id",
                    "productVariant_id",
                    "product_name",
                    "variant_label",
                    "product_image",
                    "pet_weight",
                    "quantity",
                    "original_price",
                    "price",
                    "total_price",
                ],
            },
        ],
        order: [["created_at", "DESC"]],
        limit: recentOnly ? 1 : 5,
    });

    const mapped = orders.map((order) => ({
        order_id: order.order_id,
        order_code: order.order_code,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        total_price: Number(order.total_price || 0),
        shipping_fee: Number(order.shipping_fee || 0),
        discount: Number(order.discount || 0),
        original_price: Number(order.original_price || 0),
        created_at: order.created_at,
        updated_at: order.updated_at,
        receiver_name: order.receiver_name,
        receiver_phone: order.receiver_phone,
        receiver_province: order.receiver_province,
        receiver_district: order.receiver_district,
        receiver_address: order.receiver_address,
        note: order.note || null,
        items: summarizeItems(order.orderItems || []),
        item_count: (order.orderItems || []).reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0,
        ),
        preview_image:
            (order.orderItems || []).find((item) => item.product_image)?.product_image ||
            null,
    }));

    return {
        type: "orders",
        items: mapped,
        user_question: message,
        matched_categories: [],
        applied_filters: buildAppliedFilters({ statusFilter, recentOnly }),
        confidence: calculateConfidence(mapped),
        reply:
            mapped.length > 0
                ? null
                : "Mình chưa tìm thấy đơn hàng phù hợp trong dữ liệu hiện tại.",
    };
};

module.exports = {
    findUserOrders,
};