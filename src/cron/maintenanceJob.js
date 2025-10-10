// cron/maintenanceJob.js
const cron = require("node-cron");
const dayjs = require("dayjs");
const { Op } = require("sequelize");
const db = require("../models");
const Equipment = db.Equipment;

const scheduleMaintenanceCheck = () => {
  // Cron job chạy lúc 01:00 mỗi ngày
  cron.schedule("0 1 * * *", async () => {
    console.log(" Running maintenance status check job...");

    const today = dayjs();
    const twoMonthsLater = today.add(2, "month").startOf("day").toDate();
    const twoMonthsLaterEnd = today.add(2, "month").endOf("day").toDate();

    try {
      const equipmentsToUpdate = await Equipment.findAll({
        where: {
          status: "active",
          calibrationDueDate: {
            [Op.between]: [twoMonthsLater, twoMonthsLaterEnd],
          },
        },
      });

      console.log(` Found ${equipmentsToUpdate.length} equipment(s) to update`);

      for (const eq of equipmentsToUpdate) {
        eq.status = "maintenance";
        await eq.save();
        console.log(` Updated equipmentId ${eq.equipmentId} to maintenance`);
      }
    } catch (error) {
      console.error(" Error in maintenance job:", error);
    }
  });
};

module.exports = scheduleMaintenanceCheck;
