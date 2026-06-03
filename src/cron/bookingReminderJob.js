const cron = require("node-cron");
const {
    processBookingReminders,
} = require("../services/BookingReminderService");

const scheduleBookingReminderCheck = () => {
    let isRunning = false;

    cron.schedule("* * * * *", async () => {
        if (isRunning) {
            console.log(
                "⏭️ [Booking Reminder] Previous reminder job still running, skipping...",
            );
            return;
        }

        isRunning = true;
        console.log("🕗 [Booking Reminder] Running booking reminder job...");

        try {
            const result = await processBookingReminders();

            if (result.success) {
                console.log(`✅ [Booking Reminder] ${result.message}`);
                console.log(
                    `📊 [Booking Reminder] Metrics: Total=${result.metrics.totalBookings}, Sent=${result.metrics.reminderCount}, Failed=${result.metrics.failureCount}, Duration=${result.metrics.duration}ms`,
                );
            } else {
                console.error(
                    `❌ [Booking Reminder] ${result.message}`,
                    result.error,
                );
            }
        } catch (error) {
            console.error(
                "❌ [Booking Reminder] Error in reminder job:",
                error,
            );
        } finally {
            isRunning = false;
        }
    });
};

module.exports = scheduleBookingReminderCheck;
