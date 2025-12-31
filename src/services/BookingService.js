import db from "../models/index.js";

const createBooking = async (user_id, data) => {
    const t = await db.sequelize.transaction();
    try {
        // 1️⃣ Tạo booking
        const booking = await db.Booking.create(
            {
                customer_id: user_id,
                pet_id: data.pet_id,
                date: data.date,
                status: "pending",
            },
            { transaction: t }
        );

        let totalPrice = 0;

        // 2️⃣ Tạo booking items + tính totalPrice
        for (const item of data.services) {
            const service = await db.Service.findOne({
                where: {
                    service_id: item.service_id,
                    isActive: true,
                    isDeleted: false,
                },
            });

            if (!service) throw new Error("Service not found");

            totalPrice += Number(service.price);

            await db.BookingItem.create(
                {
                    booking_id: booking.booking_id,
                    service_id: service.service_id,
                    price: service.price,
                },
                { transaction: t }
            );
        }

        // 3️⃣ Áp voucher SAU KHI đã có totalPrice
        let discountAmount = 0;
        let appliedVoucher = null;

        if (data.voucher_code) {
            const voucher = await db.Voucher.findOne({
                where: {
                    code: data.voucher_code,
                    is_active: true,
                },
                transaction: t,
            });

            if (!voucher) throw new Error("Voucher not found");

            const now = new Date();
            if (now < voucher.start_date || now > voucher.end_date)
                throw new Error("Voucher expired");

            if (voucher.quantity <= voucher.used_count)
                throw new Error("Voucher out of stock");

            if (totalPrice < voucher.min_order_value)
                throw new Error("Order not eligible for voucher");

            if (voucher.discount_type === "percent") {
                discountAmount = (totalPrice * voucher.discount) / 100;
                if (voucher.max_discount) {
                    discountAmount = Math.min(
                        discountAmount,
                        voucher.max_discount
                    );
                }
            } else {
                discountAmount = voucher.discount;
            }

            appliedVoucher = voucher;
        }

        // 4️⃣ Update booking price
        const finalTotal = totalPrice - discountAmount;

        await booking.update(
            {
                original_price: totalPrice,
                discount: discountAmount,
                total_price: finalTotal < 0 ? 0 : finalTotal,
                voucher_id: appliedVoucher?.voucher_id || null,
            },
            { transaction: t }
        );

        await booking.reload({ transaction: t });

        // 5️⃣ Lưu voucher usage
        if (appliedVoucher) {
            await db.VoucherUsage.create(
                {
                    voucher_id: appliedVoucher.voucher_id,
                    user_id: user_id,
                    booking_id: booking.booking_id,
                },
                { transaction: t }
            );

            await appliedVoucher.update(
                { used_count: appliedVoucher.used_count + 1 },
                { transaction: t }
            );
        }

        await t.commit();

        return {
            errCode: 0,
            errMessage: "Booking created successfully",
            booking,
        };
    } catch (error) {
        await t.rollback();
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const getMyBookings = async (user_id) => {
    const bookings = await db.Booking.findAll({
        where: { customer_id: user_id },
        include: [
            {
                model: db.BookingItem,
                as: "bookingItems",
                include: [
                    {
                        model: db.Service,
                        as: "service",
                        include: [
                            {
                                model: db.ServiceCategory,
                                as: "category",
                            },
                        ],
                    },
                ],
            },
        ],
        order: [["created_at", "DESC"]],
    });

    return { errCode: 0, bookings };
};
const getAllBookings = async () => {
    const bookings = await db.Booking.findAll({
        include: [
            { model: db.User, as: "customer" },
            { model: db.User, as: "staff" },
            { model: db.Pet, as: "pet" },
            {
                model: db.BookingItem,
                as: "bookingItems",
                include: [
                    {
                        model: db.Service,
                        as: "service",
                        include: [
                            {
                                model: db.ServiceCategory,
                                as: "category",
                            },
                        ],
                    },
                ],
            },
        ],
        order: [["created_at", "DESC"]],
    });

    return { errCode: 0, bookings };
};
const updateBookingStatus = async (id, status, staffId) => {
    const booking = await db.Booking.findByPk(id);
    if (!booking) {
        return { errCode: 1, errMessage: "Booking not found" };
    }

    await booking.update({
        status,
        staff_id: staffId,
    });

    return {
        errCode: 0,
        errMessage: "Booking updated successfully",
    };
};

export default {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
};
