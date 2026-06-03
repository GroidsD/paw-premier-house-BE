const db = require("../models");
const { sendBookingTimeoutEmail } = require("./BookingEmailService");
const { refundVoucherForBooking } = require("../helper/voucher");

const getTimeoutBookings = async (limit = 100) => {
    const dayjs = require("dayjs");
    const { Op } = require("sequelize");
    const now = dayjs();

    return db.Booking.findAll({
        where: {
            status: "pending",
            payment_status: {
                [Op.ne]: "paid",
            },
            created_at: {
                [Op.lte]: now.subtract(15, "minute").toDate(),
            },
        },
        include: [
            {
                model: db.User,
                as: "customer",
                attributes: ["user_id", "fullname", "email"],
            },
        ],
        order: [["created_at", "ASC"]],
        limit,
    });
};

const processBookingTimeout = async (booking, transaction) => {
    try {
        const latestBooking = await db.Booking.findByPk(booking.booking_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!latestBooking) {
            return {
                success: false,
                message: `Booking ${booking.booking_id} not found`,
            };
        }

        if (latestBooking.status !== "pending") {
            return {
                success: false,
                message: `Booking ${booking.booking_id} is no longer pending`,
            };
        }

        if (latestBooking.payment_status === "paid") {
            return {
                success: false,
                message: `Booking ${booking.booking_id} is already paid`,
            };
        }

        await latestBooking.update(
            {
                status: "cancelled",
                payment_status: "expired",
                cancelled_by: "system",
                cancel_reason: "Booking expired due to no payment",
            },
            { transaction },
        );

        await refundVoucherForBooking({
            booking: latestBooking,
            cancelledBy: "system",
            transaction,
        });

        return {
            success: true,
            message: `Booking ${booking.booking_id} expired successfully`,
            booking: latestBooking,
        };
    } catch (error) {
        throw error;
    }
};

const sendTimeoutNotification = async (booking) => {
    try {
        if (booking.customer) {
            await sendBookingTimeoutEmail({
                user: booking.customer,
                booking,
            });
        }
    } catch (error) {
        console.error(
            `Failed to send timeout email for booking ${booking.booking_id}:`,
            error,
        );
    }
};

const processTimeoutBookings = async (metrics = {}) => {
    const startTime = Date.now();
    let expiredCount = 0;
    let skippedCount = 0;
    let failureCount = 0;

    try {
        const timeoutBookings = await getTimeoutBookings(100);

        if (timeoutBookings.length === 0) {
            return {
                success: true,
                message: "No timeout bookings found",
                metrics: {
                    ...metrics,
                    totalBookings: 0,
                    expiredCount: 0,
                    skippedCount: 0,
                    failureCount: 0,
                    duration: Date.now() - startTime,
                },
            };
        }

        for (const booking of timeoutBookings) {
            const transaction = await db.sequelize.transaction();

            try {
                const result = await processBookingTimeout(
                    booking,
                    transaction,
                );

                if (result.success) {
                    await transaction.commit();
                    expiredCount++;
                    await sendTimeoutNotification(booking);
                } else {
                    await transaction.rollback();
                    skippedCount++;
                }
            } catch (error) {
                if (!transaction.finished) {
                    await transaction.rollback();
                }
                failureCount++;
                console.error(
                    `Error processing booking ${booking.booking_id}:`,
                    error,
                );
            }
        }

        return {
            success: true,
            message: `Processed ${timeoutBookings.length} timeout bookings`,
            metrics: {
                ...metrics,
                totalBookings: timeoutBookings.length,
                expiredCount,
                skippedCount,
                failureCount,
                duration: Date.now() - startTime,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "Error processing timeout bookings",
            error,
            metrics: {
                ...metrics,
                totalBookings: 0,
                expiredCount,
                skippedCount,
                failureCount,
                duration: Date.now() - startTime,
            },
        };
    }
};

module.exports = {
    processBookingTimeout,
    sendTimeoutNotification,
    getTimeoutBookings,
    processTimeoutBookings,
};
