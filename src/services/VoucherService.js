import db from "../models/index.js";
import { Op } from "sequelize";

const validateVoucher = async (code, userId, totalPrice) => {
    const voucher = await db.Voucher.findOne({
        where: {
            code,
            is_active: true,
            start_date: { [Op.lte]: new Date() },
            end_date: { [Op.gte]: new Date() },
        },
    });

    if (!voucher) throw new Error("Voucher không hợp lệ");

    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        throw new Error("Voucher đã hết lượt sử dụng");
    }

    if (voucher.min_order_value && totalPrice < voucher.min_order_value) {
        throw new Error("Đơn hàng chưa đủ điều kiện áp voucher");
    }

    return voucher;
};

const calculateDiscount = (voucher, totalPrice) => {
    let discountAmount = 0;

    if (voucher.discount_type === "percent") {
        discountAmount = (totalPrice * voucher.discount) / 100;
        if (voucher.max_discount) {
            discountAmount = Math.min(discountAmount, voucher.max_discount);
        }
    } else {
        discountAmount = voucher.discount;
    }

    return Math.min(discountAmount, totalPrice);
};

const applyVoucher = async ({
    code,
    userId,
    totalPrice,
    orderId = null,
    bookingId = null,
}) => {
    const t = await db.sequelize.transaction();
    try {
        const voucher = await validateVoucher(code, userId, totalPrice);
        const discountAmount = calculateDiscount(voucher, totalPrice);

        await voucher.increment("used_count", { transaction: t });

        await db.VoucherUsage.create(
            {
                voucher_id: voucher.voucher_id,
                user_id: userId,
                order_id: orderId,
                booking_id: bookingId,
            },
            { transaction: t }
        );

        await t.commit();

        return {
            discountAmount,
            finalPrice: totalPrice - discountAmount,
        };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};
// services/VoucherService.js
const createVoucher = async (data) => {
    const existed = await db.Voucher.findOne({
        where: { code: data.code },
    });

    if (existed) throw new Error("Voucher code đã tồn tại");

    const voucher = await db.Voucher.create({
        code: data.code,
        discount_type: data.discount_type, // percent | fixed
        discount: data.discount,
        max_discount: data.max_discount || null,
        min_order_value: data.min_order_value || 0,
        usage_limit: data.usage_limit || null,
        used_count: 0,
        apply_for: data.apply_for, // booking | order
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: true,
    });

    return voucher;
};

export default {
    applyVoucher,
    createVoucher,
};
