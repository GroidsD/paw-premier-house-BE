const { Schedule, User, Shift, WorkDate } = require("../models");
const { Op } = require("sequelize");

module.exports = {
    async getStaffSchedule(staff_id) {
        return await Schedule.findAll({
            where: { staff_id },
            include: [Shift, WorkDate],
            order: [["date_id", "ASC"]],
        });
    },

    async getAllSchedules(filters = {}) {
        const where = {};
        if (filters.staff_id) where.staff_id = filters.staff_id;
        if (filters.from && filters.to) {
            where["$WorkDate.work_date$"] = {
                [Op.between]: [filters.from, filters.to],
            };
        }

        return await Schedule.findAll({
            where,
            include: [
                { model: User, as: "staff", attributes: ["name", "email"] },
                Shift,
                WorkDate,
            ],
            order: [["date_id", "DESC"]],
        });
    },

    async updateWorkStatus(id, work_status, work_note) {
        const schedule = await Schedule.findByPk(id);
        if (!schedule) throw new Error("Schedule not found");
        await schedule.update({ work_status, work_note });
        return schedule;
    },
};
