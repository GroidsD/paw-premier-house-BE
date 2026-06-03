const cron = require("node-cron");
const { processTimeoutBookings } = require("../services/BookingTimeoutService");

const scheduleBookingTimeoutCheck = () => {
    let isRunning = false;

    cron.schedule("* * * * *", async () => {
        if (isRunning) {
            console.log(
                "⏭️ [Booking Timeout] Previous timeout job still running, skipping...",
            );
            return;
        }

        isRunning = true;
        console.log(
            "🕐 [Booking Timeout] Running booking timeout check job...",
        );

        try {
            const result = await processTimeoutBookings();

            if (result.success) {
                console.log(`✅ [Booking Timeout] ${result.message}`);
                console.log(
                    `📊 [Booking Timeout] Metrics: Total=${result.metrics.totalBookings}, Expired=${result.metrics.expiredCount}, Skipped=${result.metrics.skippedCount}, Failed=${result.metrics.failureCount}, Duration=${result.metrics.duration}ms`,
                );
            } else {
                console.error(
                    `❌ [Booking Timeout] ${result.message}`,
                    result.error,
                );
            }
        } catch (error) {
            console.error("❌ [Booking Timeout] Error in timeout job:", error);
        } finally {
            isRunning = false;
        }
    });
};

module.exports = scheduleBookingTimeoutCheck;
