const db = require("../models");
const { ORDER_STATUS, PAYMENT_STATUS } = require("./orderConstants");
const { sendOrderTimeoutEmail } = require("./OrderEmailService");

const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
};

/**
 * Batch preload variants and products to avoid N+1 queries
 * @param {Array} orderItems - Array of order items
 * @param {Object} transaction - The database transaction
 * @returns {Promise<Object>} Object with variantMap and productMap
 */
const batchPreloadStock = async (orderItems, transaction) => {
    const variantIds = new Set();
    const productIds = new Set();

    for (const item of orderItems) {
        if (item.productVariant_id) {
            variantIds.add(item.productVariant_id);
        } else if (item.product_id) {
            productIds.add(item.product_id);
        }
    }

    const variantMap = new Map();
    const productMap = new Map();

    // Batch fetch variants
    if (variantIds.size > 0) {
        const variants = await db.ProductVariant.findAll({
            where: {
                productVariant_id: {
                    [require("sequelize").Op.in]: [...variantIds],
                },
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        for (const variant of variants) {
            variantMap.set(variant.productVariant_id, variant);
        }
    }

    // Batch fetch products
    if (productIds.size > 0) {
        const products = await db.Product.findAll({
            where: {
                product_id: {
                    [require("sequelize").Op.in]: [...productIds],
                },
            },
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        for (const product of products) {
            productMap.set(product.product_id, product);
        }
    }

    return { variantMap, productMap };
};

/**
 * Process a single order timeout with race condition and idempotency protection
 * @param {Object} order - The order object to process
 * @param {Object} transaction - The database transaction
 * @returns {Promise<Object>} Result object with success status and message
 */
const processOrderTimeout = async (order, transaction) => {
    try {
        // Lock order row and re-fetch latest state to prevent race conditions
        const latestOrder = await db.Order.findByPk(order.order_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!latestOrder) {
            return {
                success: false,
                message: `Order ${order.order_id} not found`,
            };
        }

        // Idempotency protection: check if order is still pending
        if (latestOrder.status !== ORDER_STATUS.PENDING) {
            return {
                success: false,
                message: `Order ${order.order_id} is no longer pending (current status: ${latestOrder.status})`,
            };
        }

        // Race condition protection: recheck payment_status before expiring
        if (latestOrder.payment_status === PAYMENT_STATUS.PAID) {
            return {
                success: false,
                message: `Order ${order.order_id} is already paid, cannot expire`,
            };
        }

        // Batch preload variants and products to avoid N+1 queries
        const { variantMap, productMap } = await batchPreloadStock(
            order.orderItems,
            transaction,
        );

        // Release reserved stock for each order item
        for (const item of order.orderItems) {
            const qty = toNumber(item.quantity, 0);
            if (qty <= 0) continue;

            if (item.productVariant_id) {
                const variant = variantMap.get(item.productVariant_id);
                if (variant) {
                    const currentReserved =
                        toNumber(variant.reserved_quantity, 0);
                    await variant.update(
                        {
                            reserved_quantity: Math.max(0, currentReserved - qty),
                        },
                        { transaction },
                    );
                }
            } else if (item.product_id) {
                const product = productMap.get(item.product_id);
                if (product) {
                    const currentReserved =
                        toNumber(product.reserved_quantity, 0);
                    await product.update(
                        {
                            reserved_quantity: Math.max(0, currentReserved - qty),
                        },
                        { transaction },
                    );
                }
            }
        }

        // Update order status to expired
        await latestOrder.update(
            {
                status: ORDER_STATUS.EXPIRED,
                payment_status: PAYMENT_STATUS.EXPIRED,
            },
            { transaction },
        );

        return {
            success: true,
            message: `Order ${order.order_id} expired successfully`,
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Send timeout email notification for an order
 * @param {Object} order - The order object
 * @returns {Promise<void>}
 */
const sendTimeoutNotification = async (order) => {
    try {
        if (order.customer) {
            await sendOrderTimeoutEmail({
                user: order.customer,
                order: order,
            });
        }
    } catch (error) {
        // Log error but don't fail the entire process
        console.error(
            `Failed to send timeout email for order ${order.order_id}:`,
            error,
        );
    }
};

/**
 * Get timeout orders with batch processing limit
 * @param {number} limit - Maximum number of orders to fetch
 * @returns {Promise<Array>} Array of timeout orders
 */
const getTimeoutOrders = async (limit = 100) => {
    const dayjs = require("dayjs");
    const { Op } = require("sequelize");

    const now = dayjs();

    return db.Order.findAll({
        where: {
            status: ORDER_STATUS.PENDING,
            payment_status: {
                [Op.ne]: PAYMENT_STATUS.PAID,
            },
            [Op.or]: [
                {
                    reserved_until: {
                        [Op.lte]: now.toDate(),
                    },
                },
                {
                    reserved_until: null,
                    created_at: {
                        [Op.lte]: now.subtract(15, "minute").toDate(),
                    },
                },
            ],
        },
        include: [
            {
                model: db.OrderItem,
                as: "orderItems",
            },
            {
                model: db.User,
                as: "customer",
                attributes: ["user_id", "fullname", "email"],
            },
        ],
        order: [["created_at", "ASC"]],
        limit,
    });
};

/**
 * Process all timeout orders
 * @param {Object} metrics - Metrics object to track processing
 * @returns {Promise<Object>} Processing result with metrics
 */
const processTimeoutOrders = async (metrics = {}) => {
    const startTime = Date.now();
    let expiredCount = 0;
    let skippedCount = 0;
    let failureCount = 0;

    try {
        const timeoutOrders = await getTimeoutOrders(100);

        if (timeoutOrders.length === 0) {
            return {
                success: true,
                message: "No timeout orders found",
                metrics: {
                    ...metrics,
                    totalOrders: 0,
                    expiredCount: 0,
                    skippedCount: 0,
                    failureCount: 0,
                    duration: Date.now() - startTime,
                },
            };
        }

        for (const order of timeoutOrders) {
            const transaction = await db.sequelize.transaction();

            try {
                const result = await processOrderTimeout(order, transaction);

                if (result.success) {
                    await transaction.commit();
                    expiredCount++;

                    // Send email notification outside of transaction
                    await sendTimeoutNotification(order);
                } else {
                    await transaction.rollback();
                    skippedCount++;
                }
            } catch (error) {
                if (!transaction.finished) {
                    await transaction.rollback();
                }
                failureCount++;
                console.error(
                    `Error processing order ${order.order_id}:`,
                    error,
                );
            }
        }

        return {
            success: true,
            message: `Processed ${timeoutOrders.length} timeout orders`,
            metrics: {
                ...metrics,
                totalOrders: timeoutOrders.length,
                expiredCount,
                skippedCount,
                failureCount,
                duration: Date.now() - startTime,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "Error processing timeout orders",
            error,
            metrics: {
                ...metrics,
                totalOrders: 0,
                expiredCount,
                skippedCount,
                failureCount,
                duration: Date.now() - startTime,
            },
        };
    }
};

module.exports = {
    processOrderTimeout,
    sendTimeoutNotification,
    getTimeoutOrders,
    processTimeoutOrders,
};
