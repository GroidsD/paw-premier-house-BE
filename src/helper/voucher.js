import db from "../models/index.js";
import { Op } from "sequelize";

export const applyVoucherForBooking = async ({
    voucherCode,
    userId,
    totalPrice,
    transaction,
}) => {
    if (!voucherCode) {
        return {
            discount: 0,
            voucher: null,
        };
    }

    const voucher = await db.Voucher.findOne({
        where: {
            code: voucherCode,
            is_active: true,
            apply_for: { [Op.in]: ["booking", "all"] },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    if (!voucher) throw new Error("Voucher không tồn tại");

    const now = new Date();

    if (voucher.start_date && now < voucher.start_date)
        throw new Error("Voucher chưa tới thời gian sử dụng");

    if (voucher.end_date && now > voucher.end_date)
        throw new Error("Voucher đã hết hạn");

    if (
        voucher.usage_limit !== null &&
        voucher.used_count >= voucher.usage_limit
    )
        throw new Error("Voucher đã hết lượt sử dụng");

    if (voucher.min_order_value && totalPrice < Number(voucher.min_order_value))
        throw new Error("Đơn hàng chưa đủ điều kiện áp voucher");

    const used = await db.VoucherUsage.findOne({
        where: {
            voucher_id: voucher.voucher_id,
            user_id: userId,
            status: "used",
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
    });

    if (used) throw new Error("Bạn đã sử dụng voucher này rồi");

    let discount = 0;

    if (voucher.discount_type === "percent") {
        discount = (totalPrice * Number(voucher.discount)) / 100;

        if (voucher.max_discount) {
            discount = Math.min(discount, Number(voucher.max_discount));
        }
    } else {
        discount = Number(voucher.discount);
    }

    discount = Math.min(discount, totalPrice);

    return {
        voucher,
        discount,
    };
};
export const refundVoucherForBooking = async ({
    booking,
    cancelledBy,
    transaction,
}) => {
    if (!booking.voucher_id) return;

    if (cancelledBy === "customer") return;

    const usage = await db.VoucherUsage.findOne({
        where: {
            booking_id: booking.booking_id,
            voucher_id: booking.voucher_id,
            status: "used",
        },
        transaction,
    });

    if (!usage) return;

    await usage.update(
        {
            status: "refunded",
            refunded_at: new Date(),
        },
        { transaction },
    );

    await db.Voucher.decrement("used_count", {
        where: { voucher_id: booking.voucher_id },
        transaction,
    });
};
