const ORDER_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    SHIPPING: "shipping",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    DELETED: "deleted",
    EXPIRED: "expired",
};

const PAYMENT_STATUS = {
    UNPAID: "unpaid",
    PAID: "paid",
    FAILED: "failed",
    EXPIRED: "expired",
    REFUNDED: "refunded",
};

const VALID_STATUSES = Object.values(ORDER_STATUS);
const PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);

module.exports = {
    ORDER_STATUS,
    PAYMENT_STATUS,
    VALID_STATUSES,
    PAYMENT_STATUSES,
};
