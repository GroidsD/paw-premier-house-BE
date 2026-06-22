import db from "../models/index.js";
import {
    applyVoucherForBooking,
    refundVoucherForBooking,
} from "../helper/voucher.js";
import generateBookingCode from "../utils/generateBookingCode.js";
import { includes } from "lodash";

const createBooking = async (user_id, data) => {
    console.log("CREATE BOOKING DATA:", JSON.stringify(data, null, 2));
    const t = await db.sequelize.transaction();

    try {
        const bookingCode = await generateBookingCode();

        const totalPrice = data.total_price || 0;
        const paymentMethodInput = String(
            data.payment_method || "SHOP",
        ).toUpperCase();
        const paymentMethod = ["SHOP", "MOMO"].includes(paymentMethodInput)
            ? paymentMethodInput
            : "SHOP";
        const bookingStatus =
            paymentMethod === "SHOP" ? "confirmed" : "pending";

        const booking = await db.Booking.create(
            {
                booking_code: bookingCode,
                customer_id: user_id,
                pet_id: data.pet_id,
                date: data.date,
                original_price: totalPrice,
                total_price: totalPrice, // Initial total, will be updated after voucher
                payment_method: paymentMethod,
                payment_status: "unpaid",
                status: bookingStatus,
                check_in: data.check_in || null,
                check_out: data.check_out || null,
                note: data.note || null,
            },
            { transaction: t },
        );

        // Create booking items from frontend data
        for (const item of data.services) {
            // Verify service exists
            const service = await db.Service.findOne({
                where: {
                    service_id: item.service_id,
                    isActive: true,
                    isDeleted: false,
                },
                transaction: t,
            });

            if (!service) throw new Error("Service không tồn tại");

            // Use price from frontend if provided, otherwise use service price
            const itemPrice = item.price
                ? Number(item.price)
                : Number(service.price);

            await db.BookingItem.create(
                {
                    booking_id: booking.booking_id,
                    service_id: service.service_id,
                    price: itemPrice,
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
                discount,
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

        const fullBooking = await db.Booking.findByPk(booking.booking_id, {
            transaction: t,
            include: [
                {
                    model: db.Pet,
                    as: "pet",
                    attributes: ["pet_id", "name", "species", "breed"],
                },
                {
                    model: db.BookingItem,
                    as: "bookingItems",
                    include: [
                        {
                            model: db.Service,
                            as: "service",
                            attributes: [
                                "service_id",
                                "name_vi",
                                "name_en",
                                "description_vi",
                                "description_en",
                                "price",
                                "duration",
                            ],
                            include: [
                                {
                                    model: db.ServiceCategory,
                                    as: "category",
                                    attributes: [
                                        "serviceCategories_id",
                                        "type",
                                    ],
                                },
                                {
                                    model: db.Media,
                                    as: "media",
                                    attributes: [
                                        "media_id",
                                        "url",
                                        "is_main",
                                        "alt_text",
                                    ],
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: db.Voucher,
                    as: "voucher",
                    attributes: [
                        "voucher_id",
                        "code",
                        "discount_type",
                        "discount",
                    ],
                },
            ],
        });

        const user = await db.User.findByPk(user_id, {
            transaction: t,
            attributes: ["fullname", "email"],
        });

        await t.commit();

        return {
            errCode: 0,
            booking: fullBooking,
            user: user
                ? {
                      fullname: user.fullname,
                      email: user.email,
                  }
                : null,
        };
    } catch (error) {
        console.error("=== CREATE BOOKING ERROR ===");
        console.error("NAME:", error.name);
        console.error("MESSAGE:", error.message);

        if (error.errors) {
            console.error(
                "DETAILS:",
                JSON.stringify(
                    error.errors.map((e) => ({
                        field: e.path,
                        message: e.message,
                        value: e.value,
                    })),
                    null,
                    2,
                ),
            );
        }

        console.error(error);

        if (!t.finished) {
            await t.rollback();
        }

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
                        attributes: [
                            "service_id",
                            "name_vi",
                            "name_en",
                            "description_vi",
                            "description_en",
                            "price",
                            "duration",
                        ],
                        include: [
                            {
                                model: db.ServiceCategory,
                                as: "category",
                            },
                            {
                                model: db.Media,
                                as: "media",
                                attributes: [
                                    "media_id",
                                    "url",
                                    "is_main",
                                    "alt_text",
                                ],
                                required: false,
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
            {
                model: db.Pet,
                as: "pet",
                include: [
                    {
                        model: db.Media,
                        as: "media",
                        attributes: ["media_id", "url", "is_main", "alt_text"],
                        required: false,
                    },
                ],
            },
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

const updateBookingStatus = async ({ bookingId, status, staffId = null }) => {
    const t = await db.sequelize.transaction();

    try {
        const booking = await db.Booking.findByPk(bookingId, {
            transaction: t,
        });

        if (!booking) {
            throw new Error("Booking không tồn tại");
        }

        const currentStatus = booking.status;

        const validStatuses = [
            "pending",
            "confirmed",
            "assigned",
            "cancelled",
            "in-progress",
            "completed",
        ];

        if (!validStatuses.includes(status)) {
            // console.log(status);

            throw new Error("Trạng thái không hợp lệ");
        }

        const allowedTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["assigned", "cancelled"],
            assigned: ["in-progress", "cancelled"],
            "in-progress": ["completed", "cancelled"],
            completed: [],
            cancelled: [],
        };

        if (!allowedTransitions[currentStatus]?.includes(status)) {
            throw new Error(
                `Không thể chuyển từ ${currentStatus} sang ${status}`,
            );
        }

        const updateData = { status };

        if (status === "assigned") {
            if (!staffId) {
                throw new Error("Cần staffId để assign booking");
            }

            updateData.staff_id = staffId;
        }

        if (status === "in-progress") {
            updateData.check_in = booking.check_in || new Date();
        }

        if (status === "completed") {
            updateData.check_out = booking.check_out || new Date();
        }

        await booking.update(updateData, { transaction: t });

        const fullBooking = await db.Booking.findByPk(bookingId, {
            transaction: t,
            include: [
                {
                    model: db.User,
                    as: "customer",
                    attributes: ["user_id", "fullname", "email", "phone"],
                },
                {
                    model: db.User,
                    as: "staff",
                    attributes: ["user_id", "fullname", "email", "phone"],
                },
                {
                    model: db.Pet,
                    as: "pet",
                    attributes: ["pet_id", "name", "species", "breed"],
                },
                {
                    model: db.BookingItem,
                    as: "bookingItems",
                    include: [
                        {
                            model: db.Service,
                            as: "service",
                            attributes: [
                                "service_id",
                                "name_vi",
                                "name_en",
                                "description_vi",
                                "description_en",
                                "price",
                                "duration",
                            ],
                            include: [
                                {
                                    model: db.ServiceCategory,
                                    as: "category",
                                    attributes: [
                                        "serviceCategories_id",
                                        "type",
                                    ],
                                },
                                {
                                    model: db.Media,
                                    as: "media",
                                    attributes: [
                                        "media_id",
                                        "url",
                                        "is_main",
                                        "alt_text",
                                    ],
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: db.Voucher,
                    as: "voucher",
                    attributes: [
                        "voucher_id",
                        "code",
                        "discount_type",
                        "discount",
                    ],
                },
            ],
        });

        await t.commit();

        return {
            errCode: 0,
            errMessage: "Cập nhật trạng thái booking thành công",
            booking: fullBooking,
        };
    } catch (error) {
        await t.rollback();

        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};
const cancelBooking = async ({
    bookingId,
    cancelledBy,
    cancelReason,
    userId,
    role,
}) => {
    const t = await db.sequelize.transaction();

    try {
        const booking = await db.Booking.findByPk(bookingId, {
            transaction: t,
        });

        if (!booking) {
            throw new Error("Booking not found");
        }

        // Chỉ cấm hủy khi đã bắt đầu hoặc đã kết thúc
        const nonCancellableStatuses = [
            "in-progress",
            "completed",
            "cancelled",
        ];

        if (nonCancellableStatuses.includes(booking.status)) {
            throw new Error("Booking không thể huỷ");
        }

        // Customer chỉ được huỷ booking của chính mình
        if (cancelledBy === "customer" && booking.customer_id !== userId) {
            throw new Error("Không có quyền huỷ booking này");
        }

        // Staff/Admin
        if (cancelledBy === "staff") {
            const isStaffOfBooking = booking.staff_id === userId;
            const isAdmin = role === "admin";

            if (!isStaffOfBooking && !isAdmin) {
                throw new Error("Bạn không có quyền huỷ booking này");
            }
        }

        await booking.update(
            {
                status: "cancelled",
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

const updateBookingPaymentStatus = async (
    bookingId,
    payment_status,
    additionalData = {},
) => {
    const transaction = await db.sequelize.transaction();

    try {
        const validPaymentStatuses = ["unpaid", "paid", "failed", "expired"];

        if (!bookingId || !payment_status) {
            await transaction.rollback();
            return {
                errCode: 1,
                errMessage: "Missing bookingId or payment_status",
            };
        }

        if (!validPaymentStatuses.includes(payment_status)) {
            await transaction.rollback();
            return {
                errCode: 2,
                errMessage: `Invalid payment_status: ${payment_status}`,
            };
        }

        const booking = await db.Booking.findByPk(bookingId, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!booking) {
            await transaction.rollback();
            return {
                errCode: 3,
                errMessage: "Booking not found",
            };
        }

        const updateData = {
            payment_status,
            ...additionalData,
        };

        if (payment_status === "paid" && booking.status === "pending") {
            updateData.status = "confirmed";
        }

        await booking.update(updateData, { transaction });
        await transaction.commit();

        const updatedBooking = await db.Booking.findByPk(bookingId, {
            include: [
                {
                    model: db.User,
                    as: "customer",
                    attributes: ["user_id", "fullname", "email", "phone"],
                },
                {
                    model: db.User,
                    as: "staff",
                    attributes: ["user_id", "fullname", "email", "phone"],
                },
                {
                    model: db.Pet,
                    as: "pet",
                    attributes: ["pet_id", "name", "species", "breed"],
                },
                {
                    model: db.BookingItem,
                    as: "bookingItems",
                    include: [
                        {
                            model: db.Service,
                            as: "service",
                            attributes: [
                                "service_id",
                                "name_vi",
                                "name_en",
                                "description_vi",
                                "description_en",
                                "price",
                                "duration",
                            ],
                            include: [
                                {
                                    model: db.ServiceCategory,
                                    as: "category",
                                    attributes: [
                                        "serviceCategories_id",
                                        "type",
                                    ],
                                },
                                {
                                    model: db.Media,
                                    as: "media",
                                    attributes: [
                                        "media_id",
                                        "url",
                                        "is_main",
                                        "alt_text",
                                    ],
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: db.Voucher,
                    as: "voucher",
                    attributes: [
                        "voucher_id",
                        "code",
                        "discount_type",
                        "discount",
                    ],
                },
            ],
        });

        return {
            errCode: 0,
            errMessage: `Payment status updated to ${payment_status}`,
            booking: updatedBooking || booking,
        };
    } catch (error) {
        await transaction.rollback();
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

        if (booking.status !== "confirmed")
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

const getBookingById = async (bookingId) => {
    try {
        const booking = await db.Booking.findByPk(bookingId, {
            include: [
                {
                    model: db.User,
                    as: "customer",
                    attributes: ["user_id", "fullname", "email", "phone"],
                },
                {
                    model: db.User,
                    as: "staff",
                    attributes: ["user_id", "fullname", "email", "phone"],
                },
                {
                    model: db.Pet,
                    as: "pet",
                    attributes: ["pet_id", "name", "species", "breed"],
                },
                {
                    model: db.BookingItem,
                    as: "bookingItems",
                    include: [
                        {
                            model: db.Service,
                            as: "service",
                            attributes: [
                                "service_id",
                                "name_vi",
                                "name_en",
                                "description_vi",
                                "description_en",
                                "price",
                                "duration",
                            ],
                            include: [
                                {
                                    model: db.ServiceCategory,
                                    as: "category",
                                    attributes: [
                                        "serviceCategories_id",
                                        "type",
                                    ],
                                },
                                {
                                    model: db.Media,
                                    as: "media",
                                    attributes: [
                                        "media_id",
                                        "url",
                                        "is_main",
                                        "alt_text",
                                    ],
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: db.Voucher,
                    as: "voucher",
                    attributes: [
                        "voucher_id",
                        "code",
                        "discount_type",
                        "discount",
                    ],
                },
            ],
        });

        if (!booking) {
            return {
                errCode: 1,
                errMessage: "Booking không tồn tại",
            };
        }

        return {
            errCode: 0,
            data: booking,
        };
    } catch (error) {
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};

const getMyAssignedBookings = async (staffId) => {
    const bookings = await db.Booking.findAll({
        where: {
            staff_id: staffId,
        },
        include: [
            { model: db.User, as: "customer" },
            { model: db.Pet, as: "pet" },
            {
                model: db.BookingItem,
                as: "bookingItems",
                include: [
                    {
                        model: db.Service,
                        as: "service",
                    },
                ],
            },
        ],
        order: [["created_at", "DESC"]],
    });

    return {
        errCode: 0,
        bookings,
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
    updateBookingPaymentStatus,
    getMyAssignedBookings,
};
