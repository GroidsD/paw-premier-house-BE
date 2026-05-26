const cron = require("node-cron");
const dayjs = require("dayjs");
const { Op } = require("sequelize");
const db = require("../models");

const scheduleOrderTimeoutCheck = () => {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        console.log("🕐 [Order Timeout] Running order timeout check job...");

        try {
            const now = dayjs();

            // Find pending orders that have timed out
            // Orders where:
            // - status = 'pending'
            // - payment_status != 'paid'
            // - reserved_until <= NOW() OR (no reserved_until and created_at <= 15 minutes ago)
            const timeoutOrders = await db.Order.findAll({
                where: {
                    status: "pending",
                    payment_status: {
                        [Op.ne]: "paid",
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
            });

            console.log(
                `🕐 [Order Timeout] Found ${timeoutOrders.length} order(s) to cancel due to timeout`,
            );

            if (timeoutOrders.length === 0) {
                return;
            }

            for (const order of timeoutOrders) {
                const transaction = await db.sequelize.transaction();

                try {
                    console.log(
                        `🕐 [Order Timeout] Processing order ${order.order_id} (${order.order_code})`,
                    );

                    // Release reserved stock
                    for (const item of order.orderItems) {
                        const qty = Number(item.quantity) || 0;
                        if (qty <= 0) continue;

                        if (item.productVariant_id) {
                            const variant = await db.ProductVariant.findByPk(
                                item.productVariant_id,
                                {
                                    transaction,
                                    lock: transaction.LOCK.UPDATE,
                                },
                            );

                            if (variant) {
                                const currentReserved =
                                    Number(variant.reserved_quantity) || 0;
                                await variant.update(
                                    {
                                        reserved_quantity: Math.max(
                                            0,
                                            currentReserved - qty,
                                        ),
                                    },
                                    { transaction },
                                );
                                console.log(
                                    `🕐 [Order Timeout] Released ${qty} reserved stock for variant ${item.productVariant_id}`,
                                );
                            }
                        } else if (item.product_id) {
                            const product = await db.Product.findByPk(
                                item.product_id,
                                {
                                    transaction,
                                    lock: transaction.LOCK.UPDATE,
                                },
                            );

                            if (product) {
                                const currentReserved =
                                    Number(product.reserved_quantity) || 0;
                                await product.update(
                                    {
                                        reserved_quantity: Math.max(
                                            0,
                                            currentReserved - qty,
                                        ),
                                    },
                                    { transaction },
                                );
                                console.log(
                                    `🕐 [Order Timeout] Released ${qty} reserved stock for product ${item.product_id}`,
                                );
                            }
                        }
                    }

                    // Update order status
                    await order.update(
                        {
                            status: "expired",
                            payment_status: "expired",
                        },
                        { transaction },
                    );

                    await transaction.commit();

                    console.log(
                        `✅ [Order Timeout] Order ${order.order_id} cancelled successfully`,
                    );

                    // Send timeout email notification
                    try {
                        const { sendOrderTimeoutEmail } =
                            require("../services/OrderEmailService");

                        if (order.customer) {
                            await sendOrderTimeoutEmail({
                                user: order.customer,
                                order: order,
                            });
                            console.log(
                                `📧 [Order Timeout] Timeout email sent for order ${order.order_id}`,
                            );
                        }
                    } catch (emailError) {
                        console.error(
                            `❌ [Order Timeout] Failed to send timeout email for order ${order.order_id}:`,
                            emailError,
                        );
                    }
                } catch (error) {
                    console.error(
                        `❌ [Order Timeout] Error processing order ${order.order_id}:`,
                        error,
                    );
                    if (!transaction.finished) {
                        await transaction.rollback();
                    }
                }
            }

            console.log(
                `✅ [Order Timeout] Completed order timeout check. Processed ${timeoutOrders.length} order(s).`,
            );
        } catch (error) {
            console.error("❌ [Order Timeout] Error in timeout job:", error);
        }
    });
};

module.exports = scheduleOrderTimeoutCheck;
