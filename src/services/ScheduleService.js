const { Schedule, User, Shift, WorkDate } = require("../models");
const { Op } = require("sequelize");

module.exports = {
    async getStaffSchedule(staff_id) {
        return await Schedule.findAll({
            where: { staff_id },
            include: [Shift, WorkDate],
            order: [["work_date_id", "ASC"]],
        });
    },

    async getAllSchedules(filters = {}) {
        const where = {};
        if (filters.staff_id) where.staff_id = filters.staff_id;
        // if (filters.from && filters.to) {
        //     where["$WorkDate.work_date$"] = {
        //         [Op.between]: [filters.from, filters.to],
        //     };
        // }

        return await Schedule.findAll({
            where,
            include: [
                { model: User, as: "staff", attributes: ["name", "email"] },
                Shift,
            ],
        });
    },

    async updateWorkStatus(id, work_status, work_note) {
        const schedule = await Schedule.findByPk(id);
        if (!schedule) throw new Error("Schedule not found");
        await schedule.update({ work_status, work_note });
        return schedule;
    },

    async updateStatusByAdmin(id, status, work_note = null) {
        const schedule = await Schedule.findByPk(id);
        if (!schedule) throw new Error("Schedule not found");

        // Cập nhật trạng thái
        await schedule.update({
            status,
            work_note:
                status === "rejected"
                    ? `Bị từ chối: ${work_note || "Không có lý do"}`
                    : schedule.work_note,
        });

        return schedule;
    },
    async createSchedule(staff_id, schedules) {
        if (!Array.isArray(schedules) || schedules.length === 0) {
            throw new Error("Schedules must be a non-empty array");
        }

        const newSchedules = [];

        for (const s of schedules) {
            // Lấy tất cả ca đã đăng ký trong cùng ngày
            const existingSchedules = await Schedule.findAll({
                where: {
                    staff_id,
                    work_date: s.work_date,
                },
            });

            // Nếu đã có >= 3 ca thì không cho thêm nữa
            if (existingSchedules.length >= 3) {
                throw new Error(
                    `Staff has already reached the maximum of 3 shifts on ${s.work_date}`
                );
            }

            // Nếu ca (shift_id) đã tồn tại trong ngày đó => báo lỗi tránh trùng
            const isDuplicate = existingSchedules.some(
                (e) => e.shift_id === s.shift_id
            );
            if (isDuplicate) {
                throw new Error(
                    `Shift ${s.shift_id} is already registered on ${s.work_date}`
                );
            }

            // Tạo mới ca làm
            const schedule = await Schedule.create({
                staff_id,
                work_date: s.work_date,
                shift_id: s.shift_id,
                status: "pending",
                work_status: "not_started",
                work_note: s.work_note || null,
            });

            newSchedules.push(schedule);
        }

        return newSchedules;
    },
};
