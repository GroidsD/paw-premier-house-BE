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
            { transaction: t },
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
        description: data.description || null,
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
const listVouchers = async ({
    page = 1,
    pageSize = 10,
    search = "",
    type = "", // percent | fixed
    status = "", // active | inactive | expired
}) => {
    const now = new Date();
    const limit = Math.max(1, Number(pageSize) || 10);
    const offset = (Math.max(1, Number(page) || 1) - 1) * limit;

    const where = {};

    if (search) {
        where.code = { [Op.like]: `%${search}%` };
    }

    if (type) {
        where.discount_type = type; // percent | fixed
    }

    if (status) {
        if (status === "active") {
            where.is_active = true;
            where.start_date = { [Op.lte]: now };
            where.end_date = { [Op.gte]: now };
        } else if (status === "inactive") {
            // inactive = is_active false (admin tắt)
            where.is_active = false;
        } else if (status === "expired") {
            where.end_date = { [Op.lt]: now };
        }
    }

    const { rows, count } = await db.Voucher.findAndCountAll({
        where,
        order: [["created_at", "DESC"]],
        limit,
        offset,
    });

    return {
        items: rows,
        total: count,
        page: Number(page),
        pageSize: limit,
    };
};

const getVoucherStats = async () => {
    const now = new Date();

    const totalVouchers = await db.Voucher.count();

    const activeVouchers = await db.Voucher.count({
        where: {
            is_active: true,
            start_date: { [Op.lte]: now },
            end_date: { [Op.gte]: now },
        },
    });

    // expiringSoon: 7 ngày tới (bạn muốn mấy ngày thì đổi)
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const expiringSoon = await db.Voucher.count({
        where: {
            is_active: true,
            end_date: { [Op.between]: [now, in7Days] },
        },
    });

    // usedVouchers: tổng lượt dùng (sum used_count)
    const usedVouchers = (await db.Voucher.sum("used_count")) || 0;

    return { totalVouchers, activeVouchers, expiringSoon, usedVouchers };
};
export default {
    applyVoucher,
    createVoucher,
    listVouchers,
    getVoucherStats,
};
