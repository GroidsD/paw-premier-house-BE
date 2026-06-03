const db = require("../models");
const dayjs = require("dayjs");
const { Op } = require("sequelize");
const { sendBookingReminderEmail } = require("./BookingEmailService");

const getUpcomingReminders = async (limit = 100) => {
    const now = dayjs();
    const startWindow = now.add(15, "minute").startOf("minute").toDate();
    const endWindow = now.add(16, "minute").endOf("minute").toDate();

    return db.Booking.findAll({
        where: {
            payment_status: "paid",
            reminder_sent: false,
            status: {
                [Op.notIn]: ["cancelled", "completed"],
            },
            [Op.or]: [
                {
                    check_in: {
                        [Op.between]: [startWindow, endWindow],
                    },
                },
                {
                    date: {
                        [Op.between]: [startWindow, endWindow],
                    },
                },
            ],
        },
        include: [
            {
                model: db.User,
                as: "customer",
                attributes: ["user_id", "fullname", "email"],
            },
            {
                model: db.Pet,
                as: "pet",
                attributes: ["pet_id", "name"],
            },
        ],
        order: [["check_in", "ASC"]],
        limit,
    });
};

const markReminderSent = async (booking) => {
    await booking.update({ reminder_sent: true });
};

const sendReminder = async (booking) => {
    if (!booking.customer || !booking.customer.email) {
        return {
            success: false,
            message: `Customer email missing for booking ${booking.booking_id}`,
        };
    }

    try {
        await sendBookingReminderEmail({
            user: booking.customer,
            booking,
        });

        await markReminderSent(booking);

        return {
            success: true,
            booking,
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error,
        };
    }
};

const processBookingReminders = async () => {
    const startTime = Date.now();
    let reminderCount = 0;
    let failureCount = 0;

    try {
        const bookings = await getUpcomingReminders(100);

        for (const booking of bookings) {
            const result = await sendReminder(booking);

            if (result.success) {
                reminderCount++;
            } else {
                failureCount++;
                console.error(
                    `❌ [Booking Reminder] Failed to send reminder for booking ${booking.booking_id}:`,
                    result.error || result.message,
                );
            }
        }

        return {
            success: true,
            message: `Processed ${bookings.length} booking reminders`,
            metrics: {
                totalBookings: bookings.length,
                reminderCount,
                failureCount,
                duration: Date.now() - startTime,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "Error processing booking reminder jobs",
            error,
            metrics: {
                totalBookings: 0,
                reminderCount,
                failureCount,
                duration: Date.now() - startTime,
            },
        };
    }
};

module.exports = {
    processBookingReminders,
};
