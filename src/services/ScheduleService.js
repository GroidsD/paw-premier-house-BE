import db from "../models/index.js";
import { Op } from "sequelize";

const formatLocalDate = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
    ).padStart(2, "0")}`;

const getWeekRange = (weekDate) => {
    const [y, m, d] = weekDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    let dow = date.getDay();
    if (dow === 0) dow = 7;

    const monday = new Date(date);
    monday.setDate(date.getDate() - (dow - 1));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
        start: formatLocalDate(monday),
        end: formatLocalDate(sunday),
    };
};

let getAllSchedules = async () => {
    return await db.Schedule.findAll({
        include: [
            {
                model: db.Shift,
                as: "shift",
                attributes: [
                    "shift_id",
                    "shift_name",
                    "start_time",
                    "end_time",
                ],
            },
            {
                model: db.ScheduleStaff,
                as: "registrations",
                include: [
                    {
                        model: db.User,
                        as: "scheduleStaffUser",
                        attributes: ["user_id", "fullname", "email"],
                    },
                    {
                        model: db.User,
                        as: "replacedBy",
                        attributes: ["user_id", "fullname", "email"],
                    },
                ],
            },
        ],
        order: [
            ["work_date", "ASC"],
            ["shift_id", "ASC"],
        ],
    });
};

let getScheduleById = async (schedule_id) => {
    const schedule = await db.Schedule.findByPk(schedule_id, {
        include: [
            {
                association: db.Schedule.associations.shift,
                attributes: [
                    "shift_id",
                    "shift_name",
                    "start_time",
                    "end_time",
                ],
            },
            {
                association: db.Schedule.associations.registrations,
                include: [
                    {
                        association:
                            db.ScheduleStaff.associations.scheduleStaffUser,
                        attributes: ["user_id", "fullname", "email"],
                    },
                    {
                        association: db.ScheduleStaff.associations.replacedBy,
                        attributes: ["user_id", "fullname", "email"],
                    },
                ],
            },
        ],
    });

    if (!schedule) throw new Error("Schedule not found");
    return schedule;
};

let registerSchedule = async (staff_id, shift_id, work_date) => {
    if (!staff_id) throw new Error("Missing staff_id");
    if (!shift_id) throw new Error("Missing shift_id");
    if (!work_date) throw new Error("Missing work_date");

    const schedule = await db.Schedule.findOne({
        where: { shift_id, work_date },
    });

    if (!schedule) {
        throw new Error(
            `Schedule not found for shift_id=${shift_id}, work_date=${work_date}`,
        );
    }

    if (schedule.status !== "open") {
        throw new Error("Shift is not open");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const workDateObj = new Date(work_date);
    workDateObj.setHours(0, 0, 0, 0);

    if (workDateObj < today) {
        throw new Error("Cannot register past shift");
    }

    const existingRegistration = await db.ScheduleStaff.findOne({
        where: {
            staff_id,
            schedule_id: schedule.schedule_id,
        },
    });

    if (existingRegistration) {
        if (["available", "busy"].includes(existingRegistration.status)) {
            throw new Error("Already registered for this shift");
        }

        if (existingRegistration.status === "absent") {
            throw new Error("You were marked absent for this shift");
        }
    }

    const currentCount = await db.ScheduleStaff.count({
        where: {
            schedule_id: schedule.schedule_id,
            status: { [Op.in]: ["available", "busy"] },
        },
    });

    if (currentCount >= schedule.max_people) {
        throw new Error("This shift is full");
    }

    return await db.ScheduleStaff.create({
        schedule_id: schedule.schedule_id,
        staff_id,
        status: "available",
    });
};

let approveSchedule = async (schedule_staff_id) => {
    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id, {
        include: [
            {
                association: db.ScheduleStaff.associations.schedule,
                attributes: ["schedule_id", "max_people"],
            },
        ],
    });

    if (!reg) throw new Error("Registration not found");

    if (reg.status === "busy") {
        throw new Error("This registration is already approved");
    }

    if (reg.status === "absent") {
        throw new Error("Cannot approve an absent registration");
    }

    const approvedCount = await db.ScheduleStaff.count({
        where: {
            schedule_id: reg.schedule_id,
            status: "busy",
        },
    });

    if (approvedCount >= reg.schedule.max_people) {
        throw new Error("This shift is already full");
    }

    reg.status = "busy";
    await reg.save();

    return reg;
};

let markAbsentSchedule = async (schedule_staff_id) => {
    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id);
    if (!reg) throw new Error("Registration not found");

    reg.status = "absent";
    await reg.save();

    return reg;
};

let replaceSchedule = async (schedule_staff_id, replacement_staff_id) => {
    if (!replacement_staff_id) throw new Error("Missing replacement_staff_id");

    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id, {
        include: [
            {
                association: db.ScheduleStaff.associations.schedule,
                attributes: ["schedule_id", "max_people"],
            },
        ],
    });

    if (!reg) throw new Error("Registration not found");

    const existedReplacement = await db.ScheduleStaff.findOne({
        where: {
            schedule_id: reg.schedule_id,
            staff_id: replacement_staff_id,
            status: { [Op.in]: ["available", "busy"] },
        },
    });

    if (existedReplacement) {
        throw new Error("Replacement staff already has this shift");
    }

    await db.sequelize.transaction(async (t) => {
        reg.status = "absent";
        reg.replaced_by = replacement_staff_id;
        await reg.save({ transaction: t });

        await db.ScheduleStaff.create(
            {
                schedule_id: reg.schedule_id,
                staff_id: replacement_staff_id,
                status: "busy",
            },
            { transaction: t },
        );
    });

    return await db.ScheduleStaff.findByPk(schedule_staff_id, {
        include: [
            {
                association: db.ScheduleStaff.associations.scheduleStaffUser,
                attributes: ["user_id", "fullname", "email"],
            },
            {
                association: db.ScheduleStaff.associations.replacedBy,
                attributes: ["user_id", "fullname", "email"],
            },
        ],
    });
};

let updateSchedule = async (schedule_id, data) => {
    const schedule = await db.Schedule.findByPk(schedule_id);
    if (!schedule) throw new Error("Schedule not found");

    return await schedule.update(data);
};

let deleteSchedule = async (schedule_id) => {
    const schedule = await db.Schedule.findByPk(schedule_id);
    if (!schedule) throw new Error("Schedule not found");

    await schedule.destroy();
    return "Schedule deleted successfully";
};

let createWeeklySchedule = async (
    startDate,
    shifts,
    maxPeople,
    selectedDays = [1, 2, 3, 4, 5, 6, 7],
) => {
    if (!startDate) throw new Error("Missing startDate");

    if (!Array.isArray(shifts) || shifts.length === 0) {
        throw new Error("shifts must be a non-empty array");
    }

    if (!maxPeople || maxPeople <= 0) {
        throw new Error("maxPeople must be a positive number");
    }

    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
        throw new Error("selectedDays must be a non-empty array");
    }

    const validShifts = await db.Shift.findAll({
        where: { shift_id: shifts },
    });

    if (validShifts.length !== shifts.length) {
        const validIds = validShifts.map((s) => s.shift_id);
        throw new Error(
            `Some shift_id do not exist. Provided: [${shifts}], Valid: [${validIds}]`,
        );
    }

    const { start } = getWeekRange(startDate);
    const [year, month, day] = start.split("-").map(Number);
    const monday = new Date(year, month - 1, day);

    const dates = [];

    for (const dayIndex of selectedDays) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + (dayIndex - 1));
        dates.push(formatLocalDate(d));
    }

    return await db.sequelize.transaction(async (t) => {
        const createdSchedules = [];

        for (const date of dates) {
            for (const shift_id of shifts) {
                const exists = await db.Schedule.findOne({
                    where: { shift_id, work_date: date },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (exists) continue;

                const schedule = await db.Schedule.create(
                    {
                        shift_id,
                        work_date: date,
                        max_people: maxPeople,
                        status: "closed",
                    },
                    { transaction: t },
                );

                createdSchedules.push(schedule);
            }
        }

        return createdSchedules;
    });
};

let getMySchedule = async (staff_id) => {
    if (!staff_id) throw new Error("Invalid staff ID");

    const mySchedules = await db.ScheduleStaff.findAll({
        where: {
            staff_id,
            status: { [Op.in]: ["available", "busy", "absent"] },
        },
        include: [
            {
                association: db.ScheduleStaff.associations.schedule,
                attributes: [
                    "schedule_id",
                    "work_date",
                    "status",
                    "max_people",
                ],
                include: [
                    {
                        association: db.Schedule.associations.shift,
                        attributes: ["shift_name", "start_time", "end_time"],
                    },
                ],
            },
            {
                association: db.ScheduleStaff.associations.replacedBy,
                attributes: ["user_id", "fullname", "email"],
            },
        ],
        order: [[db.ScheduleStaff.associations.schedule, "work_date", "ASC"]],
    });

    return {
        errCode: 0,
        data: mySchedules.map((item) => {
            const scheduleData = item.schedule || {};
            const shiftData = scheduleData.shift || {};

            return {
                schedule_staff_id: item.schedule_staff_id,
                schedule_id: scheduleData.schedule_id,
                register_status: item.status,
                schedule_status: scheduleData.status,
                work_date: scheduleData.work_date,
                shift_name: shiftData.shift_name,
                start_time: shiftData.start_time,
                end_time: shiftData.end_time,
                replaced_by: item.replacedBy,
            };
        }),
    };
};

let openWeeklySchedule = async (weekDate) => {
    if (!weekDate) throw new Error("Missing weekDate");

    const { start, end } = getWeekRange(weekDate);

    const [updatedCount] = await db.Schedule.update(
        { status: "open" },
        {
            where: {
                work_date: { [Op.between]: [start, end] },
                status: "closed",
            },
        },
    );

    return {
        message: "Schedules opened successfully",
        week_start: start,
        week_end: end,
        updatedCount,
    };
};

let getSchedulesByWeek = async (weekDate) => {
    if (!weekDate) throw new Error("Missing weekDate");

    const { start, end } = getWeekRange(weekDate);

    const schedules = await db.Schedule.findAll({
        where: {
            work_date: { [Op.between]: [start, end] },
        },
        include: [
            {
                model: db.Shift,
                as: "shift",
                attributes: [
                    "shift_id",
                    "shift_name",
                    "start_time",
                    "end_time",
                ],
            },
            {
                model: db.ScheduleStaff,
                as: "registrations",
                include: [
                    {
                        model: db.User,
                        as: "scheduleStaffUser",
                        attributes: ["user_id", "fullname", "email"],
                    },
                    {
                        model: db.User,
                        as: "replacedBy",
                        attributes: ["user_id", "fullname", "email"],
                    },
                ],
            },
        ],
        order: [
            ["work_date", "ASC"],
            ["shift_id", "ASC"],
        ],
    });

    return {
        week_start: start,
        week_end: end,
        schedules,
    };
};
let updateWeeklySchedule = async (
    startDate,
    shifts,
    maxPeople,
    selectedDays = [1, 2, 3, 4, 5, 6, 7],
) => {
    if (!startDate) throw new Error("Missing startDate");

    if (!Array.isArray(shifts) || shifts.length === 0) {
        throw new Error("shifts must be a non-empty array");
    }

    if (!maxPeople || maxPeople <= 0) {
        throw new Error("maxPeople must be a positive number");
    }

    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
        throw new Error("selectedDays must be a non-empty array");
    }

    const validShifts = await db.Shift.findAll({
        where: { shift_id: shifts },
    });

    if (validShifts.length !== shifts.length) {
        const validIds = validShifts.map((s) => s.shift_id);
        throw new Error(
            `Some shift_id do not exist. Provided: [${shifts}], Valid: [${validIds}]`,
        );
    }

    const { start, end } = getWeekRange(startDate);
    const [year, month, day] = start.split("-").map(Number);
    const monday = new Date(year, month - 1, day);

    const targetPairs = [];
    const targetKeySet = new Set();

    for (const dayIndex of selectedDays) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + (dayIndex - 1));
        const date = formatLocalDate(d);

        for (const shift_id of shifts) {
            const key = `${date}_${shift_id}`;
            targetKeySet.add(key);
            targetPairs.push({ work_date: date, shift_id });
        }
    }

    return await db.sequelize.transaction(async (t) => {
        const existingSchedules = await db.Schedule.findAll({
            where: {
                work_date: { [Op.between]: [start, end] },
            },
            include: [
                {
                    model: db.ScheduleStaff,
                    as: "registrations",
                    required: false,
                },
            ],
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        const existingMap = new Map();
        for (const item of existingSchedules) {
            existingMap.set(`${item.work_date}_${item.shift_id}`, item);
        }

        const created = [];
        const updated = [];
        const deleted = [];
        const skippedDelete = [];

        // 1. Create missing + update existing
        for (const pair of targetPairs) {
            const key = `${pair.work_date}_${pair.shift_id}`;
            const existing = existingMap.get(key);

            if (!existing) {
                const newSchedule = await db.Schedule.create(
                    {
                        shift_id: pair.shift_id,
                        work_date: pair.work_date,
                        max_people: maxPeople,
                        status: "closed",
                    },
                    { transaction: t },
                );

                created.push(newSchedule);
            } else {
                await existing.update(
                    {
                        max_people: maxPeople,
                    },
                    { transaction: t },
                );

                updated.push(existing.schedule_id);
            }
        }

        // 2. Delete schedules no longer selected
        for (const existing of existingSchedules) {
            const key = `${existing.work_date}_${existing.shift_id}`;

            if (!targetKeySet.has(key)) {
                const hasRegistrations =
                    Array.isArray(existing.registrations) &&
                    existing.registrations.length > 0;

                if (hasRegistrations) {
                    skippedDelete.push({
                        schedule_id: existing.schedule_id,
                        work_date: existing.work_date,
                        shift_id: existing.shift_id,
                    });
                    continue;
                }

                await existing.destroy({ transaction: t });
                deleted.push(existing.schedule_id);
            }
        }

        return {
            createdCount: created.length,
            updatedCount: updated.length,
            deletedCount: deleted.length,
            skippedDeleteCount: skippedDelete.length,
            skippedDelete,
        };
    });
};

export default {
    getAllSchedules,
    getScheduleById,
    registerSchedule,
    approveSchedule,
    markAbsentSchedule,
    replaceSchedule,
    updateSchedule,
    deleteSchedule,
    createWeeklySchedule,
    getMySchedule,
    openWeeklySchedule,
    getSchedulesByWeek,
    updateWeeklySchedule,
};
