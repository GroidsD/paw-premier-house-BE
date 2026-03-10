import db from "../models/index.js";
import {
    applyVoucherForBooking,
    refundVoucherForBooking,
} from "../helper/voucher.js";

const createBooking = async (user_id, data) => {
    const t = await db.sequelize.transaction();

    try {
        const booking = await db.Booking.create(
            {
                customer_id: user_id,
                pet_id: data.pet_id,
                date: data.date,
                status: "pending",
            },
            { transaction: t },
        );

        let totalPrice = 0;

        for (const item of data.services) {
            const service = await db.Service.findOne({
                where: {
                    service_id: item.service_id,
                    isActive: true,
                    isDeleted: false,
                },
            });

            if (!service) throw new Error("Service không tồn tại");

            totalPrice += Number(service.price);

            await db.BookingItem.create(
                {
                    booking_id: booking.booking_id,
                    service_id: service.service_id,
                    price: service.price,
                },
                { transaction: t },
            );
        }

        const { voucher, discount } = await applyVoucherForBooking({
            voucherCode: data.voucher_code,
            userId: user_id,
            totalPrice,
            transaction: t,
        });

        const finalTotal = totalPrice - discount;

        await booking.update(
            {
                original_price: totalPrice,
                discount: discount,
                total_price: finalTotal,
                voucher_id: voucher ? voucher.voucher_id : null,
            },
            { transaction: t },
        );

        if (voucher) {
            await db.VoucherUsage.create(
                {
                    voucher_id: voucher.voucher_id,
                    user_id: user_id,
                    booking_id: booking.booking_id,
                    status: "used",
                },
                { transaction: t },
            );

            await voucher.increment("used_count", { transaction: t });
        }

        await booking.reload({ transaction: t });
        await t.commit();

        const user = await db.User.findByPk(user_id, {
            attributes: ["fullname", "email"],
        });

        return {
            errCode: 0,
            booking,
            user: user
                ? {
                      fullname: user.fullname,
                      email: user.email,
                  }
                : null,
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

const cancelBooking = async ({
    bookingId,
    cancelledBy,
    cancelReason,
    userId,
}) => {
    const t = await db.sequelize.transaction();

    try {
        const booking = await db.Booking.findByPk(bookingId, {
            transaction: t,
        });

        if (!booking) throw new Error("Booking not found");

        if (booking.status !== "pending")
            throw new Error("Booking không thể huỷ");

        if (cancelledBy === "customer" && booking.customer_id !== userId) {
            throw new Error("Không có quyền huỷ booking này");
        }

        if (cancelledBy === "staff") {
            const isStaffOfBooking = booking.staff_id === userId;
            const isAdmin = req.user?.role === "admin";

            if (!isStaffOfBooking && !isAdmin) {
                throw new Error("Bạn không có quyền huỷ booking này");
            }
        }

        await booking.update(
            {
                status: "rejected",
                cancelled_by: cancelledBy,
                cancel_reason: cancelReason,
            },
            { transaction: t },
        );

        await refundVoucherForBooking({
            booking,
            cancelledBy,
            transaction: t,
        });

        await t.commit();

        return {
            errCode: 0,
            errMessage: "Booking cancelled successfully",
        };
    } catch (error) {
        await t.rollback();
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const assignBookingToStaff = async ({ bookingId, staffId, scheduleId }) => {
    const t = await db.sequelize.transaction();

    try {
        const booking = await db.Booking.findByPk(bookingId, {
            transaction: t,
        });

        if (!booking) throw new Error("Booking không tồn tại");

        if (booking.status !== "pending")
            throw new Error("Booking không thể nhận");

        const scheduleStaff = await db.ScheduleStaff.findOne({
            where: {
                schedule_id: scheduleId,
                staff_id: staffId,
                status: "available",
            },
            transaction: t,
        });

        if (!scheduleStaff)
            throw new Error("Staff không thuộc ca hoặc đang bận");

        await booking.update(
            {
                staff_id: staffId,
                status: "assigned",
            },
            { transaction: t },
        );

        await scheduleStaff.update(
            {
                status: "busy",
                booking_id: booking.booking_id,
            },
            { transaction: t },
        );

        await t.commit();

        return {
            errCode: 0,
            errMessage: "Nhận booking thành công",
        };
    } catch (error) {
        await t.rollback();
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const getBookingById = async (id) => {
    const booking = await db.Booking.findByPk(id, {
        include: [
            {
                model: db.User,
                as: "customer",
                attributes: ["user_id", "fullname", "email", "phone"],
            },
        ],
    });

    if (!booking) {
        return {
            errCode: 1,
            errMessage: "Booking not found",
        };
    }

    return {
        errCode: 0,
        errMessage: "Get booking successfully",
        data: booking,
    };
};

export default {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    cancelBooking,
    assignBookingToStaff,
    getBookingById,
};
