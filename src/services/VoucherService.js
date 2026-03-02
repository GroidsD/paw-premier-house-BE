import db from "../models/index.js";
import { Op } from "sequelize";

const calculateDiscount = (voucher, totalPrice) => {
    let discountAmount = 0;

    if (voucher.discount_type === "percent") {
        discountAmount = (Number(totalPrice) * Number(voucher.discount)) / 100;
        if (voucher.max_discount) {
            discountAmount = Math.min(
                discountAmount,
                Number(voucher.max_discount),
            );
        }
    } else if (voucher.discount_type === "fixed") {
        discountAmount = Number(voucher.discount);
    }

    return Math.min(discountAmount, Number(totalPrice));
};

const applyVoucher = async ({
    code,
    userId,
    totalPrice,
    orderId = null,
    bookingId = null,
}) => {
    return await db.sequelize.transaction(async (t) => {
        const now = new Date();

        // 1) lock voucher row
        const voucher = await db.Voucher.findOne({
            where: {
                code,
                is_active: true,
                start_date: { [Op.lte]: now },
                end_date: { [Op.gte]: now },
            },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!voucher) throw new Error("Voucher không hợp lệ");

        // 2) check apply_for
        if (voucher.apply_for === "order" && !orderId)
            throw new Error("Voucher chỉ áp dụng cho Order");
        if (voucher.apply_for === "booking" && !bookingId)
            throw new Error("Voucher chỉ áp dụng cho Booking");
        // all => ok

        // 3) check usage_limit
        if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
            throw new Error("Voucher đã hết lượt sử dụng");
        }

        // 4) check min order
        if (
            voucher.min_order_value &&
            Number(totalPrice) < Number(voucher.min_order_value)
        ) {
            throw new Error("Đơn hàng chưa đủ điều kiện áp voucher");
        }

        // 5) create usage FIRST (unique index đảm bảo 1 user 1 lần)
        try {
            await db.VoucherUsage.create(
                {
                    voucher_id: voucher.voucher_id,
                    user_id: userId,
                    order_id: orderId,
                    booking_id: bookingId,
                    status: "used",
                    used_at: now,
                },
                { transaction: t },
            );
        } catch (err) {
            // SequelizeUniqueConstraintError
            if (err?.name === "SequelizeUniqueConstraintError") {
                throw new Error("Bạn đã dùng voucher này rồi");
            }
            throw err;
        }

        // 6) then increment used_count
        await voucher.increment("used_count", { by: 1, transaction: t });

        const discountAmount = calculateDiscount(voucher, totalPrice);

        return {
            discountAmount,
            finalPrice: Number(totalPrice) - discountAmount,
        };
    });
};
// services/VoucherService.js
const createVoucher = async (data) => {
    const existed = await db.Voucher.findOne({
        where: { code: data.code },
    });

    if (existed) throw new Error("Voucher code đã tồn tại");
    if (!["percent", "fixed"].includes(data.discount_type))
        throw new Error("discount_type không hợp lệ");
    if (!["order", "booking", "all"].includes(data.apply_for || "all"))
        throw new Error("apply_for không hợp lệ");
    const voucher = await db.Voucher.create({
        code: data.code,
        discount_type: data.discount_type, // percent | fixed
        discount: data.discount,
        description: data.description || null,
        max_discount: data.max_discount || null,
        min_order_value: data.min_order_value || 0,
        usage_limit: data.usage_limit || null,
        used_count: 0,
        apply_for: data.apply_for || "all",
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
const updateVoucher = async (id, data) => {
    const voucher = await db.Voucher.findByPk(id);
    if (!voucher) throw new Error("Voucher không tồn tại");

    // nếu đổi code thì check trùng
    if (data.code && data.code !== voucher.code) {
        const existed = await db.Voucher.findOne({
            where: { code: data.code },
        });
        if (existed) throw new Error("Voucher code đã tồn tại");
    }

    // validate enum nếu gửi lên
    if (
        data.discount_type &&
        !["percent", "fixed"].includes(data.discount_type)
    ) {
        throw new Error("discount_type không hợp lệ");
    }
    if (
        data.apply_for &&
        !["order", "booking", "all"].includes(data.apply_for)
    ) {
        throw new Error("apply_for không hợp lệ");
    }

    // validate date nếu có
    const start = data.start_date
        ? new Date(data.start_date)
        : new Date(voucher.start_date);
    const end = data.end_date
        ? new Date(data.end_date)
        : new Date(voucher.end_date);
    if (start && end && start >= end)
        throw new Error("start_date phải trước end_date");

    // cập nhật fields cho phép edit
    await voucher.update({
        code: data.code ?? voucher.code,
        discount_type: data.discount_type ?? voucher.discount_type,
        discount: data.discount ?? voucher.discount,
        description: data.description ?? voucher.description,
        max_discount: data.max_discount ?? voucher.max_discount,
        min_order_value: data.min_order_value ?? voucher.min_order_value,
        usage_limit: data.usage_limit ?? voucher.usage_limit,
        apply_for: data.apply_for ?? voucher.apply_for,
        start_date: data.start_date ?? voucher.start_date,
        end_date: data.end_date ?? voucher.end_date,
        is_active:
            typeof data.is_active === "boolean"
                ? data.is_active
                : voucher.is_active,
    });

    return voucher;
};
export default {
    applyVoucher,
    createVoucher,
    listVouchers,
    getVoucherStats,
    updateVoucher,
    
};
