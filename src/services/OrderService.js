import db from "../models";
import { Op } from "sequelize";

const VALID_STATUSES = [
    "pending",
    "confirmed",
    "shipping",
    "completed",
    "cancelled",
    "deleted",
];

const PAYMENT_STATUSES = ["unpaid", "paid", "failed", "refunded"];

const ORDER_INCLUDE = [
    {
        model: db.User,
        as: "customer",
        attributes: ["user_id", "fullname", "email", "phone"],
        required: false,
    },
    {
        model: db.OrderItem,
        as: "orderItems",
        include: [
            {
                model: db.Product,
                as: "product",
                required: false,
                include: [
                    { model: db.Media, as: "media", required: false },
                    {
                        model: db.ProductTranslate,
                        as: "translates",
                        required: false,
                    },
                ],
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

const calcDiscountedPrice = (originalPrice, discount = 0, discountType = "fixed") => {
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

const calcOrderDiscountValue = (subtotal, discount = 0, discountType = "fixed") => {
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

const getOrderWithRelations = async (orderId, transaction = null) => {
    return db.Order.findByPk(orderId, {
        include: ORDER_INCLUDE,
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
    return (
        variant?.image ||
        variant?.thumbnail ||
        product?.image ||
        product?.thumbnail ||
        null
    );
};

const restoreStockForOrder = async (order, transaction) => {
    if (!order?.orderItems?.length) return;

    for (const item of order.orderItems) {
        const qty = toNumber(item.quantity, 0);
        if (qty <= 0) continue;

        if (item.productVariant_id) {
            const variant = await db.ProductVariant.findByPk(item.productVariant_id, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (variant) {
                await variant.update(
                    {
                        quantity: toNumber(variant.quantity, 0) + qty,
                    },
                    { transaction }
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
                    { transaction }
                );
            }
        }
    }
};

let createOrder = async (data) => {
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
            await transaction.rollback();
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
            await transaction.rollback();
            return {
                errCode: 2,
                errMessage: "Missing receiver information",
            };
        }

        if (!["COD", "BANK", "WALLET", "CARD"].includes(payment_method)) {
            await transaction.rollback();
            return {
                errCode: 3,
                errMessage: "Invalid payment_method",
            };
        }

        if (!PAYMENT_STATUSES.includes(payment_status)) {
            await transaction.rollback();
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
                await transaction.rollback();
                return {
                    errCode: 5,
                    errMessage: "Invalid product_id or quantity",
                };
            }

            const product = await db.Product.findByPk(productId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!product) {
                await transaction.rollback();
                return {
                    errCode: 6,
                    errMessage: `Product ${productId} not found`,
                };
            }

            let variant = null;
            if (productVariantId) {
                variant = await db.ProductVariant.findByPk(productVariantId, {
                    transaction,
                    lock: transaction.LOCK.UPDATE,
                });

                if (!variant) {
                    await transaction.rollback();
                    return {
                        errCode: 7,
                        errMessage: `Variant ${productVariantId} not found`,
                    };
                }

                if (
                    variant.product_id &&
                    Number(variant.product_id) !== Number(product.product_id)
                ) {
                    await transaction.rollback();
                    return {
                        errCode: 8,
                        errMessage: `Variant ${productVariantId} does not belong to product ${productId}`,
                    };
                }
            }

            const stockSource = variant || product;
            const availableStock = toNumber(stockSource.quantity, 0);

            if (quantity > availableStock) {
                await transaction.rollback();
                return {
                    errCode: 9,
                    errMessage: `Insufficient stock for ${
                        variant
                            ? `variant ${productVariantId}`
                            : `product ${product.product_id}`
                    }`,
                };
            }

            const originalPrice = toNumber(
                variant ? variant.original_price : product.original_price,
                0
            );
            const itemDiscount = toNumber(
                variant ? variant.discount : product.discount,
                0
            );
            const itemDiscountType =
                (variant ? variant.discount_type : product.discount_type) || "fixed";

            const finalUnitPrice = calcDiscountedPrice(
                originalPrice,
                itemDiscount,
                itemDiscountType
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

            await stockSource.update(
                {
                    quantity: availableStock - quantity,
                },
                { transaction }
            );
        }

        subtotalOriginal = Number(subtotalOriginal.toFixed(2));
        subtotalAfterItemDiscount = Number(subtotalAfterItemDiscount.toFixed(2));

        const safeOrderDiscountType =
            orderDiscountTypeInput === "percent" ? "percent" : "fixed";

        const orderDiscountValue = calcOrderDiscountValue(
            subtotalAfterItemDiscount,
            orderDiscountInput,
            safeOrderDiscountType
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
                ).toFixed(2)
            )
        );

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
                status: "pending",
            },
            { transaction }
        );

        await db.OrderItem.bulkCreate(
            orderItemsData.map((item) => ({
                ...item,
                order_id: order.order_id,
            })),
            { transaction }
        );

        await transaction.commit();

        const newOrder = await getOrderWithRelations(order.order_id);

        let user = null;
        if (customer_id) {
            const foundUser = await db.User.findByPk(customer_id, {
                attributes: ["fullname", "email"],
            });
            if (foundUser) {
                user = {
                    fullname: foundUser.fullname,
                    email: foundUser.email,
                };
            }
        }

        return {
            errCode: 0,
            errMessage: "Order created successfully",
            order: newOrder,
            user,
        };
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
};

let getAllOrders = async () => {
    try {
        const orders = await db.Order.findAll({
            include: ORDER_INCLUDE,
            order: [["order_id", "DESC"]],
        });

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

        const order = await db.Order.findOne({
            where: { order_id },
            include: ORDER_INCLUDE,
        });

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
            await transaction.rollback();
            return {
                errCode: 1,
                errMessage: "Missing order_id or status",
            };
        }

        if (!VALID_STATUSES.includes(newStatus)) {
            await transaction.rollback();
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
            await transaction.rollback();
            return {
                errCode: 3,
                errMessage: "Order not found",
            };
        }

        if (order.status === "deleted") {
            await transaction.rollback();
            return {
                errCode: 4,
                errMessage: "Cannot update a deleted order",
            };
        }

        if (order.status === "cancelled" && newStatus !== "deleted") {
            await transaction.rollback();
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
            await transaction.rollback();
            return {
                errCode: 6,
                errMessage: `Cannot change status from ${currentStatus} to ${newStatus}`,
            };
        }

        if (currentStatus === newStatus) {
            await transaction.rollback();
            return {
                errCode: 0,
                errMessage: "Status is already up to date",
                order,
            };
        }

        if (newStatus === "cancelled") {
            await restoreStockForOrder(order, transaction);
        }

        const updateData = { status: newStatus };

        if (newStatus === "completed" && order.payment_method === "COD") {
            updateData.payment_status = "paid";
        }

        await order.update(updateData, { transaction });

        await transaction.commit();

        const updatedOrder = await getOrderWithRelations(order_id);

        return {
            errCode: 0,
            errMessage: `Order status updated to ${newStatus}`,
            order: updatedOrder,
        };
    } catch (e) {
        await transaction.rollback();
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
            await transaction.rollback();
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
            await transaction.rollback();
            return {
                errCode: 2,
                errMessage: "Order not found",
            };
        }

        if (order.status !== "deleted") {
            await transaction.rollback();
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
        await transaction.rollback();
        throw e;
    }
};

let getAllOrdersByUserId = async (customer_id) => {
    try {
        if (!customer_id) {
            return {
                errCode: 1,
                errMessage: "Missing customer_id",
            };
        }

        const orders = await db.Order.findAll({
            where: { customer_id },
            include: ORDER_INCLUDE,
            order: [["order_id", "DESC"]],
        });

        return {
            errCode: 0,
            errMessage: "Fetched orders successfully",
            orders,
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
};