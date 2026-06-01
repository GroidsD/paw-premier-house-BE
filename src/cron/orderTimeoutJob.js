const cron = require("node-cron");
const { processTimeoutOrders } = require("../services/OrderTimeoutService");

const scheduleOrderTimeoutCheck = () => {
    let isRunning = false;

    // Run every minute
    cron.schedule("* * * * *", async () => {
        if (isRunning) {
            console.log("⏭️ [Order Timeout] Previous timeout job still running, skipping...");
            return;
        }

        isRunning = true;
        console.log("🕐 [Order Timeout] Running order timeout check job...");

        try {
            const result = await processTimeoutOrders();

            if (result.success) {
                console.log(`✅ [Order Timeout] ${result.message}`);
                console.log(
                    `📊 [Order Timeout] Metrics: Total=${result.metrics.totalOrders}, Expired=${result.metrics.expiredCount}, Skipped=${result.metrics.skippedCount}, Failed=${result.metrics.failureCount}, Duration=${result.metrics.duration}ms`,
                );
            } else {
                console.error(
                    `❌ [Order Timeout] ${result.message}`,
                    result.error,
                );
            }
        } catch (error) {
            console.error("❌ [Order Timeout] Error in timeout job:", error);
        } finally {
            isRunning = false;
        }
    });
};

module.exports = scheduleOrderTimeoutCheck;
