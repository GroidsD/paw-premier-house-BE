import db from "../models";
const dayjs = require("dayjs");

const VALID_STATUSES = [
    "pending",
    "confirmed",
    "shipping",
    "completed",
    "cancelled",
    "deleted",
    "expired",
];

const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "expired", "refunded"];

const ORDER_INCLUDE_SAFE = [
    {
        model: db.User,
        as: "customer",
        attributes: ["user_id", "fullname", "email", "phone"],
        required: false,
    },
    {
        model: db.OrderItem,
        as: "orderItems",
        required: false,
    },
];

const ORDER_INCLUDE_FULL = [
    {
        model: db.User,
        as: "customer",
        attributes: ["user_id", "fullname", "email", "phone"],
        required: false,
    },
    {
        model: db.OrderItem,
        as: "orderItems",
        required: false,
        include: [
            {
                model: db.Product,
                as: "product",
                required: false,
                include: [{ model: db.Media, as: "media", required: false }],
            },
            {
                model: db.ProductVariant,
                as: "variant",
                required: false,
            },
        ],
    },
];

const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
};

const normalizeQuantity = (value) => {
    const quantity = parseInt(value, 10);
    return Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
};

const calcDiscountedPrice = (
    originalPrice,
    discount = 0,
    discountType = "fixed",
) => {
    let finalPrice = toNumber(originalPrice, 0);
    const d = toNumber(discount, 0);

    if (d > 0) {
        if (discountType === "percent") {
            finalPrice = finalPrice - (finalPrice * d) / 100;
        } else {
            finalPrice = finalPrice - d;
        }
    }

    return finalPrice < 0 ? 0 : Number(finalPrice.toFixed(2));
};

const calcOrderDiscountValue = (
    subtotal,
    discount = 0,
    discountType = "fixed",
) => {
    const sub = toNumber(subtotal, 0);
    const d = toNumber(discount, 0);

    if (d <= 0) return 0;

    let value = 0;
    if (discountType === "percent") {
        value = (sub * d) / 100;
    } else {
        value = d;
    }

    if (value < 0) value = 0;
    if (value > sub) value = sub;

    return Number(value.toFixed(2));
};

const getOrderWithRelations = async (
    orderId,
    transaction = null,
    useSafeInclude = false,
) => {
    return db.Order.findByPk(orderId, {
        include: useSafeInclude ? ORDER_INCLUDE_SAFE : ORDER_INCLUDE_FULL,
        transaction,
    });
};

const buildVariantLabel = (variant) => {
    if (!variant) return null;

    return (
        variant.variant_label ||
        variant.name ||
        variant.variant_name ||
        variant.title ||
        null
    );
};

const buildSku = (variant, product) => {
    return variant?.sku || product?.sku || null;
};

const buildImage = (variant, product) => {
    const mainMedia =
        product?.media?.find((item) => item.is_main)?.url ||
        product?.media?.[0]?.url ||
        null;

    return mainMedia;
};

const getUserForOrderMail = async (customer_id) => {
    if (!customer_id) return null;

    const foundUser = await db.User.findOne({
        where: { user_id: customer_id },
        attributes: ["user_id", "fullname", "email"],
    });

    if (!foundUser) return null;

    return {
        user_id: foundUser.user_id,
        fullname: foundUser.fullname,
        email: foundUser.email,
    };
};

const getAvailableStock = (stockSource) => {
    const quantity = toNumber(stockSource?.quantity, 0);
    const reserved = toNumber(stockSource?.reserved_quantity, 0);
    return Math.max(0, quantity - reserved);
};

const reserveStockForItems = async (items, transaction) => {
    for (const item of items) {
        const qty = toNumber(item.quantity, 0);
        if (qty <= 0) continue;

        if (item.productVariant_id) {
            const variant = await db.ProductVariant.findByPk(
                item.productVariant_id,
                {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                },
            );

            if (!variant) {
                throw new Error(
                    `Variant ${item.productVariant_id} not found during reserve`,
                );
            }

            const available = getAvailableStock(variant);
            if (qty > available) {
                throw new Error(
                    `Insufficient stock for variant ${item.productVariant_id}`,
                );
            }

            await variant.update(
                {
                    reserved_quantity:
                        toNumber(variant.reserved_quantity, 0) + qty,
                },
                { transaction },
            );
        } else if (item.product_id) {
            const product = await db.Product.findByPk(item.product_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!product) {
                throw new Error(
                    `Product ${item.product_id} not found during reserve`,
                );
            }

            const available = getAvailableStock(product);
            if (qty > available) {
                throw new Error(
                    `Insufficient stock for product ${item.product_id}`,
                );
            }

            await product.update(
                {
                    reserved_quantity:
                        toNumber(product.reserved_quantity, 0) + qty,
                },
                { transaction },
            );
        }
    }
};

const confirmReservedStockForOrder = async (order, transaction) => {
    if (!order?.orderItems?.length) return;

    for (const item of order.orderItems) {
        const qty = toNumber(item.quantity, 0);
        if (qty <= 0) continue;

        if (item.productVariant_id) {
            const variant = await db.ProductVariant.findByPk(
                item.productVariant_id,
                {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                },
            );

            if (!variant) {
                throw new Error(
                    `Variant ${item.productVariant_id} not found during confirm`,
                );
            }

            const currentQty = toNumber(variant.quantity, 0);
            const currentReserved = toNumber(variant.reserved_quantity, 0);

            if (currentReserved < qty) {
                throw new Error(
                    `Reserved stock is insufficient for variant ${item.productVariant_id}`,
                );
            }

            if (currentQty < qty) {
                throw new Error(
                    `Actual stock is insufficient for variant ${item.productVariant_id}`,
                );
            }

            await variant.update(
                {
                    quantity: currentQty - qty,
                    reserved_quantity: currentReserved - qty,
                },
                { transaction },
            );
        } else if (item.product_id) {
            const product = await db.Product.findByPk(item.product_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!product) {
                throw new Error(
                    `Product ${item.product_id} not found during confirm`,
                );
            }

            const currentQty = toNumber(product.quantity, 0);
            const currentReserved = toNumber(product.reserved_quantity, 0);

            if (currentReserved < qty) {
                throw new Error(
                    `Reserved stock is insufficient for product ${item.product_id}`,
                );
            }

            if (currentQty < qty) {
                throw new Error(
                    `Actual stock is insufficient for product ${item.product_id}`,
                );
            }

            await product.update(
                {
                    quantity: currentQty - qty,
                    reserved_quantity: currentReserved - qty,
                },
                { transaction },
            );
        }
    }
};

const releaseReservedStockForOrder = async (order, transaction) => {
    if (!order?.orderItems?.length) return;

    for (const item of order.orderItems) {
        const qty = toNumber(item.quantity, 0);
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
                const currentReserved = toNumber(variant.reserved_quantity, 0);

                await variant.update(
                    {
                        reserved_quantity: Math.max(0, currentReserved - qty),
                    },
                    { transaction },
                );
            }
        } else if (item.product_id) {
            const product = await db.Product.findByPk(item.product_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (product) {
                const currentReserved = toNumber(product.reserved_quantity, 0);

                await product.update(
                    {
                        reserved_quantity: Math.max(0, currentReserved - qty),
                    },
                    { transaction },
                );
            }
        }
    }
};

const restoreActualStockForOrder = async (order, transaction) => {
    if (!order?.orderItems?.length) return;

    for (const item of order.orderItems) {
        const qty = toNumber(item.quantity, 0);
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
                await variant.update(
                    {
                        quantity: toNumber(variant.quantity, 0) + qty,
                    },
                    { transaction },
                );
            }
        } else if (item.product_id) {
            const product = await db.Product.findByPk(item.product_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (product) {
                await product.update(
                    {
                        quantity: toNumber(product.quantity, 0) + qty,
                    },
                    { transaction },
                );
            }
        }
    }
};

let createOrder = async (userId, data) => {
    const transaction = await db.sequelize.transaction();

    try {
        const {
            customer_id = null,
            receiver_name,
            receiver_phone,
            receiver_province,
            receiver_district,
            receiver_address,
            note = null,
            payment_method = "COD",
            payment_status = "unpaid",
            voucher_code = null,
            shipping_fee: inputShippingFee,
            discount: orderDiscountInput = 0,
            discount_type: orderDiscountTypeInput = "fixed",
            items = [],
        } = data;

        if (!Array.isArray(items) || items.length === 0) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 1,
                errMessage: "Missing items",
            };
        }

        if (
            !receiver_name ||
            !receiver_phone ||
            !receiver_province ||
            !receiver_district ||
            !receiver_address
        ) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 2,
                errMessage: "Missing receiver information",
            };
        }

        if (!["COD", "BANK", "WALLET", "CARD"].includes(payment_method)) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 3,
                errMessage: "Invalid payment_method",
            };
        }

        if (!PAYMENT_STATUSES.includes(payment_status)) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 4,
                errMessage: "Invalid payment_status",
            };
        }

        let subtotalOriginal = 0;
        let subtotalAfterItemDiscount = 0;
        const orderItemsData = [];

        for (const rawItem of items) {
            const productId = toNumber(rawItem.product_id, 0);
            const productVariantId = rawItem.productVariant_id
                ? toNumber(rawItem.productVariant_id, 0)
                : null;
            const quantity = normalizeQuantity(rawItem.quantity);

            if (!productId || !quantity) {
                if (!transaction.finished) await transaction.rollback();
                return {
                    errCode: 5,
                    errMessage: "Invalid product_id or quantity",
                };
            }

            const product = await db.Product.findByPk(productId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
                include: [
                    {
                        model: db.Media,
                        as: "media",
                        required: false,
                    },
                ],
            });

            if (!product) {
                if (!transaction.finished) await transaction.rollback();
                return {
                    errCode: 6,
                    errMessage: `Product ${productId} not found`,
                };
            }

            if (product.isActive === false || product.isActive === 0 || product.isDelete === true || product.isDelete === 1) {
                if (!transaction.finished) await transaction.rollback();
                return {
                    errCode: 10,
                    errMessage: `Product ${productId} is inactive or deleted`,
                };
            }

            let variant = null;
            if (productVariantId) {
                variant = await db.ProductVariant.findByPk(productVariantId, {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (!variant) {
                    if (!transaction.finished) await transaction.rollback();
                    return {
                        errCode: 7,
                        errMessage: `Variant ${productVariantId} not found`,
                    };
                }

                if (variant.isActive === false || variant.isActive === 0) {
                    if (!transaction.finished) await transaction.rollback();
                    return {
                        errCode: 11,
                        errMessage: `Variant ${productVariantId} is inactive`,
                    };
                }

                if (
                    variant.product_id &&
                    Number(variant.product_id) !== Number(product.product_id)
                ) {
                    if (!transaction.finished) await transaction.rollback();
                    return {
                        errCode: 8,
                        errMessage: `Variant ${productVariantId} does not belong to product ${productId}`,
                    };
                }
            }

            const stockSource = variant || product;
            const availableStock = getAvailableStock(stockSource);

            if (quantity > availableStock) {
                if (!transaction.finished) await transaction.rollback();
                return {
                    errCode: 9,
                    errMessage: `Insufficient available stock for ${
                        variant
                            ? `variant ${productVariantId}`
                            : `product ${product.product_id}`
                    }`,
                };
            }

            const originalPrice = toNumber(
                variant ? variant.original_price : product.original_price,
                0,
            );
            const itemDiscount = toNumber(
                variant ? variant.discount : product.discount,
                0,
            );
            const itemDiscountType =
                (variant ? variant.discount_type : product.discount_type) ||
                "fixed";

            const finalUnitPrice = calcDiscountedPrice(
                originalPrice,
                itemDiscount,
                itemDiscountType,
            );
            const lineTotal = Number((finalUnitPrice * quantity).toFixed(2));

            subtotalOriginal += originalPrice * quantity;
            subtotalAfterItemDiscount += lineTotal;

            orderItemsData.push({
                product_id: product.product_id,
                productVariant_id: variant?.productVariant_id || null,
                product_name:
                    product.product_name ||
                    product.name ||
                    product.title ||
                    `Product #${product.product_id}`,
                variant_label: buildVariantLabel(variant),
                sku: buildSku(variant, product),
                product_image: buildImage(variant, product),
                pet_weight: rawItem.pet_weight || null,
                quantity,
                original_price: Number(originalPrice.toFixed(2)),
                discount: Number(itemDiscount.toFixed(2)),
                discount_type: itemDiscountType,
                price: finalUnitPrice,
                total_price: lineTotal,
            });
        }

        subtotalOriginal = Number(subtotalOriginal.toFixed(2));
        subtotalAfterItemDiscount = Number(
            subtotalAfterItemDiscount.toFixed(2),
        );

        const safeOrderDiscountType =
            orderDiscountTypeInput === "percent" ? "percent" : "fixed";

        const orderDiscountValue = calcOrderDiscountValue(
            subtotalAfterItemDiscount,
            orderDiscountInput,
            safeOrderDiscountType,
        );

        const shippingFee =
            inputShippingFee !== undefined && inputShippingFee !== null
                ? Math.max(0, toNumber(inputShippingFee, 0))
                : subtotalAfterItemDiscount >= 300000
                  ? 0
                  : 30000;

        const totalPrice = Math.max(
            0,
            Number(
                (
                    subtotalAfterItemDiscount -
                    orderDiscountValue +
                    shippingFee
                ).toFixed(2),
            ),
        );

        const isCodPayment = payment_method === "COD";
        const order = await db.Order.create(
            {
                customer_id,
                receiver_name,
                receiver_phone,
                receiver_province,
                receiver_district,
                receiver_address,
                note,
                payment_method,
                payment_status,
                voucher_code,
                original_price: subtotalAfterItemDiscount,
                discount: orderDiscountValue,
                discount_type: "fixed",
                shipping_fee: shippingFee,
                total_price: totalPrice,
                status: isCodPayment ? "confirmed" : "pending",
                reserved_until: isCodPayment
                    ? null
                    : dayjs().add(15, "minute").toDate(),
            },
            { transaction },
        );

        await db.OrderItem.bulkCreate(
            orderItemsData.map((item) => ({
                ...item,
                order_id: order.order_id,
            })),
            { transaction },
        );

        if (isCodPayment) {
            for (const item of orderItemsData) {
                const qty = toNumber(item.quantity, 0);
                if (qty <= 0) continue;

                if (item.productVariant_id) {
                    const variant = await db.ProductVariant.findByPk(
                        item.productVariant_id,
                        {
                            transaction,
                            lock: transaction.LOCK.UPDATE,
                        },
                    );

                    if (!variant) {
                        throw new Error(
                            `Variant ${item.productVariant_id} not found during confirm`,
                        );
                    }

                    const currentQty = toNumber(variant.quantity, 0);
                    const currentReserved = toNumber(
                        variant.reserved_quantity,
                        0,
                    );

                    if (currentQty < qty) {
                        throw new Error(
                            `Actual stock is insufficient for variant ${item.productVariant_id}`,
                        );
                    }

                    await variant.update(
                        {
                            quantity: currentQty - qty,
                        },
                        { transaction },
                    );
                } else if (item.product_id) {
                    const product = await db.Product.findByPk(item.product_id, {
                        transaction,
                        lock: transaction.LOCK.UPDATE,
                    });

                    if (!product) {
                        throw new Error(
                            `Product ${item.product_id} not found during confirm`,
                        );
                    }

                    const currentQty = toNumber(product.quantity, 0);

                    if (currentQty < qty) {
                        throw new Error(
                            `Actual stock is insufficient for product ${item.product_id}`,
                        );
                    }

                    await product.update(
                        {
                            quantity: currentQty - qty,
                        },
                        { transaction },
                    );
                }
            }
        } else {
            await reserveStockForItems(orderItemsData, transaction);
        }

        await transaction.commit();

        let newOrder = null;
        let user = null;

        try {
            user = await getUserForOrderMail(customer_id);

            try {
                newOrder = await getOrderWithRelations(
                    order.order_id,
                    null,
                    false,
                );
            } catch (fullIncludeError) {
                console.error(
                    "getOrderWithRelations FULL failed, fallback SAFE:",
                    fullIncludeError,
                );
                newOrder = await getOrderWithRelations(
                    order.order_id,
                    null,
                    true,
                );
            }

            if (isCodPayment && user && newOrder) {
                try {
                    const {
                        sendPaymentSuccessEmail,
                    } = require("./OrderEmailService");
                    await sendPaymentSuccessEmail({
                        user,
                        order: newOrder,
                    });
                } catch (emailError) {
                    console.error(
                        "Failed to send COD order email:",
                        emailError,
                    );
                }
            }
        } catch (afterCommitError) {
            console.error("Post-commit fetch error:", afterCommitError);
            return {
                errCode: 0,
                errMessage: "Order created successfully, but reload failed",
                order,
                user,
            };
        }

        return {
            errCode: 0,
            errMessage: "Order created successfully",
            order: newOrder || order,
            user,
        };
    } catch (e) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw e;
    }
};

let getAllOrders = async () => {
    try {
        let orders = [];

        try {
            orders = await db.Order.findAll({
                include: ORDER_INCLUDE_FULL,
                order: [["order_id", "DESC"]],
            });
        } catch (fullIncludeError) {
            console.error(
                "getAllOrders FULL include failed, fallback SAFE:",
                fullIncludeError,
            );

            orders = await db.Order.findAll({
                include: ORDER_INCLUDE_SAFE,
                order: [["order_id", "DESC"]],
            });
        }

        return {
            errCode: 0,
            errMessage: "Fetched orders successfully",
            orders,
        };
    } catch (e) {
        throw e;
    }
};

let getOrderById = async (order_id) => {
    try {
        if (!order_id) {
            return {
                errCode: 1,
                errMessage: "Missing order_id",
            };
        }

        let order = null;

        try {
            order = await db.Order.findOne({
                where: { order_id },
                include: ORDER_INCLUDE_FULL,
            });
        } catch (fullIncludeError) {
            console.error(
                "getOrderById FULL include failed, fallback SAFE:",
                fullIncludeError,
            );

            order = await db.Order.findOne({
                where: { order_id },
                include: ORDER_INCLUDE_SAFE,
            });
        }

        if (!order) {
            return {
                errCode: 2,
                errMessage: "Order not found",
            };
        }

        return {
            errCode: 0,
            errMessage: "Fetched order successfully",
            order,
        };
    } catch (e) {
        throw e;
    }
};

let updateOrderStatus = async (order_id, newStatus) => {
    const transaction = await db.sequelize.transaction();

    try {
        if (!order_id || !newStatus) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 1,
                errMessage: "Missing order_id or status",
            };
        }

        if (!VALID_STATUSES.includes(newStatus)) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 2,
                errMessage: `Invalid status: ${newStatus}`,
            };
        }

        const order = await db.Order.findByPk(order_id, {
            include: [{ model: db.OrderItem, as: "orderItems" }],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 3,
                errMessage: "Order not found",
            };
        }

        if (order.status === "deleted") {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 4,
                errMessage: "Cannot update a deleted order",
            };
        }

        if (order.status === "cancelled" && newStatus !== "deleted") {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 5,
                errMessage: "Cancelled order can only be moved to deleted",
            };
        }

        const currentStatus = order.status;

        const allowedTransitions = {
            pending: ["confirmed", "cancelled", "deleted"],
            confirmed: ["shipping", "cancelled", "deleted"],
            shipping: ["completed", "cancelled"],
            completed: ["deleted"],
            cancelled: ["deleted"],
            deleted: [],
        };

        if (
            currentStatus !== newStatus &&
            !allowedTransitions[currentStatus]?.includes(newStatus)
        ) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 6,
                errMessage: `Cannot change status from ${currentStatus} to ${newStatus}`,
            };
        }

        if (currentStatus === newStatus) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 0,
                errMessage: "Status is already up to date",
                order,
            };
        }

        if (currentStatus === "pending" && newStatus === "confirmed") {
            if (
                order.payment_method !== "COD" &&
                order.payment_status !== "paid"
            ) {
                if (!transaction.finished) await transaction.rollback();
                return {
                    errCode: 7,
                    errMessage: "Order has not been paid yet",
                };
            }

            await confirmReservedStockForOrder(order, transaction);
        }

        if (newStatus === "cancelled") {
            if (currentStatus === "pending") {
                await releaseReservedStockForOrder(order, transaction);
            } else if (
                currentStatus === "confirmed" ||
                currentStatus === "shipping"
            ) {
                await restoreActualStockForOrder(order, transaction);
            }
        }

        const updateData = { status: newStatus };

        if (newStatus === "completed" && order.payment_method === "COD") {
            updateData.payment_status = "paid";
        }

        await order.update(updateData, { transaction });

        await transaction.commit();

        let updatedOrder = null;

        try {
            updatedOrder = await getOrderWithRelations(order_id, null, false);
        } catch (fullIncludeError) {
            console.error(
                "updateOrderStatus FULL include failed, fallback SAFE:",
                fullIncludeError,
            );
            updatedOrder = await getOrderWithRelations(order_id, null, true);
        }

        // Send email notifications for status changes
        try {
            if (newStatus === "shipping" || newStatus === "completed") {
                const {
                    sendOrderShippingEmail,
                    sendOrderCompletedEmail,
                } = require("./OrderEmailService");

                if (updatedOrder?.customer) {
                    const user = {
                        user_id: updatedOrder.customer.user_id,
                        fullname: updatedOrder.customer.fullname,
                        email: updatedOrder.customer.email,
                    };

                    if (newStatus === "shipping") {
                        await sendOrderShippingEmail({
                            user,
                            order: updatedOrder,
                        });
                    } else if (newStatus === "completed") {
                        await sendOrderCompletedEmail({
                            user,
                            order: updatedOrder,
                        });
                    }
                }
            }
        } catch (emailError) {
            console.error(
                `❌ [OrderService] Failed to send ${newStatus} email:`,
                emailError,
            );
        }

        return {
            errCode: 0,
            errMessage: `Order status updated to ${newStatus}`,
            order: updatedOrder || order,
        };
    } catch (e) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw e;
    }
};

let confirmOrder = async (order_id) => {
    return updateOrderStatus(order_id, "confirmed");
};

let cancelOrder = async (order_id) => {
    return updateOrderStatus(order_id, "cancelled");
};

let softDeleteOrder = async (order_id) => {
    return updateOrderStatus(order_id, "deleted");
};

let hardDeleteOrder = async (order_id) => {
    const transaction = await db.sequelize.transaction();

    try {
        if (!order_id) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 1,
                errMessage: "Missing order_id",
            };
        }

        const order = await db.Order.findByPk(order_id, {
            include: [{ model: db.OrderItem, as: "orderItems" }],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 2,
                errMessage: "Order not found",
            };
        }

        if (order.status !== "deleted") {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 3,
                errMessage: "Only deleted orders can be hard deleted",
            };
        }

        await db.OrderItem.destroy({
            where: { order_id },
            transaction,
        });

        await db.Order.destroy({
            where: { order_id },
            transaction,
        });

        await transaction.commit();

        return {
            errCode: 0,
            errMessage: "Order hard deleted successfully",
        };
    } catch (e) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw e;
    }
};

let updateOrderPaymentStatus = async (
    order_id,
    payment_status,
    additionalData = {},
) => {
    const transaction = await db.sequelize.transaction();

    try {
        if (!order_id || !payment_status) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 1,
                errMessage: "Missing order_id or payment_status",
            };
        }

        if (!PAYMENT_STATUSES.includes(payment_status)) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 2,
                errMessage: `Invalid payment_status: ${payment_status}`,
            };
        }

        const order = await db.Order.findByPk(order_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 3,
                errMessage: "Order not found",
            };
        }

        if (order.status === "deleted") {
            if (!transaction.finished) await transaction.rollback();
            return {
                errCode: 4,
                errMessage: "Cannot update payment for deleted order",
            };
        }

        // Prepare update data
        const updateData = {
            payment_status,
            ...additionalData,
        };

        if (payment_status === "paid" && order.status === "pending") {
            if (order.payment_method !== "COD") {
                updateData.status = "confirmed";
                const orderWithItems = await db.Order.findByPk(order_id, {
                    include: [{ model: db.OrderItem, as: "orderItems" }],
                    transaction,
                });

                if (orderWithItems?.orderItems?.length) {
                    await confirmReservedStockForOrder(
                        orderWithItems,
                        transaction,
                    );
                }
            }
        }

        await order.update(updateData, { transaction });

        await transaction.commit();

        let updatedOrder = null;
        try {
            updatedOrder = await getOrderWithRelations(order_id, null, false);
        } catch (fullIncludeError) {
            updatedOrder = await getOrderWithRelations(order_id, null, true);
        }

        const result = {
            errCode: 0,
            errMessage: `Payment status updated to ${payment_status}`,
            order: updatedOrder || order,
        };

        return result;
    } catch (e) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        throw e;
    }
};

let getAllOrdersByUserId = async (
    customer_id,
    limit = 10,
    cursor = null,
    status = "all",
) => {
    try {
        if (!customer_id) {
            return {
                errCode: 1,
                errMessage: "Missing customer_id",
            };
        }

        const pageSize = parseInt(limit) || 10;
        const whereClause = { customer_id };

        if (status && status !== "all") {
            whereClause.status = status;
        }

        if (cursor) {
            // Cursor-based: fetch items older than the cursor
            // We use [Op.lt] because we sort DESC (newest first)
            whereClause.created_at = {
                [db.Sequelize.Op.lt]: cursor,
            };
        }

        const fetchOrders = async (includeType) => {
            return db.Order.findAll({
                where: whereClause,
                include: includeType,
                order: [
                    ["created_at", "DESC"],
                    ["order_id", "DESC"],
                ],
                limit: pageSize + 1, // Fetch one extra to check if there's more
            });
        };

        let orders = [];
        try {
            orders = await fetchOrders(ORDER_INCLUDE_FULL);
        } catch (fullIncludeError) {
            console.error(
                "getAllOrdersByUserId FULL include failed, fallback SAFE:",
                fullIncludeError,
            );
            orders = await fetchOrders(ORDER_INCLUDE_SAFE);
        }

        const hasMore = orders.length > pageSize;
        if (hasMore) {
            orders.pop(); // Remove the extra item
        }

        const nextCursor =
            orders.length > 0 ? orders[orders.length - 1].created_at : null;

        return {
            errCode: 0,
            errMessage: "Fetched orders successfully",
            orders,
            nextCursor,
            hasMore,
        };
    } catch (e) {
        throw e;
    }
};

export default {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    confirmOrder,
    cancelOrder,
    softDeleteOrder,
    hardDeleteOrder,
    getAllOrdersByUserId,
    updateOrderPaymentStatus,
};
