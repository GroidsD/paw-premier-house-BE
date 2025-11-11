import db from "../models/index.js";
import { Op } from "sequelize";

let createSchedule = (staff_id, schedules) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!Array.isArray(schedules) || schedules.length === 0) {
                return reject("Schedules must be a non-empty array");
            }

            const newSchedules = [];

            for (const s of schedules) {
                // Kiểm tra ca trùng hoặc quá số lượng cho phép
                const existing = await db.Schedule.findAll({
                    where: {
                        staff_id,
                        work_date: s.work_date,
                    },
                });

                if (existing.length >= 3) {
                    return reject(
                        `Staff ${staff_id} has already reached the maximum of 3 shifts on ${s.work_date}`
                    );
                }

                const isDuplicate = existing.some(
                    (e) => e.shift_id === s.shift_id
                );
                if (isDuplicate) {
                    return reject(
                        `Shift ${s.shift_id} is already registered on ${s.work_date}`
                    );
                }

                // Tạo mới ca làm
                const schedule = await db.Schedule.create({
                    staff_id,
                    work_date: s.work_date,
                    shift_id: s.shift_id,
                    status: "pending",
                    work_status: "not_started",
                    work_note: s.work_note || null,
                });

                newSchedules.push(schedule);
            }

            resolve(newSchedules);
        } catch (e) {
            reject(e);
        }
    });
};

let getAllSchedules = (filters = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const where = {};

            // Filter theo staff_id
            if (filters.staff_id) where.staff_id = filters.staff_id;

            // Filter theo ngày
            if (filters.fromDate && filters.toDate) {
                where.work_date = {
                    [Op.between]: [filters.fromDate, filters.toDate],
                };
            }

            // Filter theo status
            if (filters.status) {
                where.status = filters.status;
            }

            // Lấy tất cả schedule
            const schedules = await db.Schedule.findAll({
                where,
                include: [
                    {
                        model: db.User,
                        as: "staff",
                        attributes: ["fullname", "email", "role"],
                    },
                    {
                        model: db.Shift,
                        attributes: [
                            "shift_id",
                            "name",
                            "start_time",
                            "end_time",
                            "duration_hours",
                        ],
                    },
                    {
                        model: db.User,
                        as: "replacement",
                        attributes: ["fullname", "email"],
                    },
                ],
                order: [["work_date", "ASC"]],
            });

            // Gộp theo ngày
            const grouped = schedules.reduce((acc, cur) => {
                if (!acc[cur.work_date]) acc[cur.work_date] = [];

                const item = {
                    schedule_id: cur.schedule_id,
                    staff_id: cur.staff_id,
                    staff_name: cur.staff?.fullname || null,
                    staff_email: cur.staff?.email || null,
                    staff_role: cur.staff?.role || null,
                    shift_id: cur.Shift.shift_id,
                    shift_name: cur.Shift.name,
                    start_time: cur.Shift.start_time,
                    end_time: cur.Shift.end_time,
                    duration_hours: cur.Shift.duration_hours,
                    status: cur.status,
                    work_status: cur.work_status,
                    work_note: cur.work_note,
                    created_at: cur.created_at,
                    updated_at: cur.updated_at,
                    replacement:
                        cur.status === "replaced" && cur.replacement
                            ? {
                                  fullname: cur.replacement.fullname,
                                  email: cur.replacement.email,
                              }
                            : null,
                };

                acc[cur.work_date].push(item);
                return acc;
            }, {});

            // Chuyển sang array gọn cho FE
            const result = Object.entries(grouped).map(([date, shifts]) => ({
                work_date: date,
                shifts,
            }));

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
};
let getScheduleById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await db.Schedule.findByPk(id, {
                include: [
                    {
                        model: db.User,
                        as: "staff",
                        attributes: ["fullname", "email"],
                    },
                    { model: db.Shift },
                    {
                        model: db.User,
                        as: "replacement",
                        attributes: ["fullname"],
                    },
                ],
            });

            if (!schedule) return reject("Schedule not found");
            resolve(schedule);
        } catch (e) {
            reject(e);
        }
    });
};

let updateWorkStatus = (id, work_status, work_note) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await db.Schedule.findByPk(id);
            if (!schedule) return reject("Schedule not found");

            await schedule.update({ work_status, work_note });
            resolve(schedule);
        } catch (e) {
            reject(e);
        }
    });
};

let updateStatusByAdmin = (id, status, work_note = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await db.Schedule.findByPk(id);
            if (!schedule) return reject("Schedule not found");

            await schedule.update({
                status,
                work_note:
                    status === "rejected"
                        ? `Bị từ chối: ${work_note || "Không có lý do"}`
                        : schedule.work_note,
            });

            resolve(schedule);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteSchedule = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await db.Schedule.findByPk(id);
            if (!schedule) return reject("Schedule not found");

            await schedule.destroy();
            resolve("Schedule deleted successfully");
        } catch (e) {
            reject(e);
        }
    });
};

let getStaffSchedule = (staff_id, fromDate = null, toDate = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0=CN

            // Nếu không truyền from/to thì tự tính tuần hiện tại (hoặc tuần sau nếu CN)
            if (!fromDate || !toDate) {
                const monday = new Date(today);

                if (dayOfWeek === 0) {
                    // CN → tuần sau
                    monday.setDate(today.getDate() + 1);
                } else {
                    monday.setDate(today.getDate() - (dayOfWeek - 1));
                }

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);

                fromDate = monday.toISOString().split("T")[0];
                toDate = sunday.toISOString().split("T")[0];
            }

            // Lấy tất cả schedule mà user là staff_id hoặc được replace
            const schedules = await db.Schedule.findAll({
                where: {
                    [Op.or]: [{ staff_id }, { replaced_by: staff_id }],
                    work_date: {
                        [Op.between]: [fromDate, toDate],
                    },
                },
                include: [
                    { model: db.Shift },
                    {
                        model: db.User,
                        as: "staff",
                        attributes: ["fullname", "email"],
                    },
                    {
                        model: db.User,
                        as: "replacement",
                        attributes: ["fullname", "email"],
                    },
                ],
                order: [["work_date", "ASC"]],
            });

            // Gom lịch theo ngày
            const grouped = schedules.reduce((acc, cur) => {
                if (!acc[cur.work_date]) acc[cur.work_date] = [];

                acc[cur.work_date].push({
                    schedule_id: cur.schedule_id,
                    shift_id: cur.Shift.shift_id,
                    shift_name: cur.Shift.name,
                    start_time: cur.Shift.start_time,
                    end_time: cur.Shift.end_time,
                    duration_hours: cur.Shift.duration_hours,
                    work_status: cur.work_status,
                    status: cur.status,
                    work_note: cur.work_note,
                    staff_name: cur.staff?.fullname,
                    staff_email: cur.staff?.email,
                    replacement_name: cur.replacement?.fullname || null,
                    replacement_email: cur.replacement?.email || null,
                    isReplacement: cur.replaced_by === staff_id, // true nếu là người nhận ca
                });

                return acc;
            }, {});

            const result = Object.entries(grouped).map(([date, shifts]) => ({
                work_date: date,
                shifts,
            }));

            resolve({
                week_range: { from: fromDate, to: toDate },
                schedules: result,
            });
        } catch (e) {
            reject(e);
        }
    });
};

export default {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateWorkStatus,
    updateStatusByAdmin,
    deleteSchedule,
    getStaffSchedule,
};
