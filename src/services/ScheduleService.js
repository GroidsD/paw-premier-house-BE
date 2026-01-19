import db from "../models/index.js";
import { Op } from "sequelize";
// Lấy tất cả schedule kèm shift + staff
// services/ScheduleService.js

let getAllSchedules = async () => {
    return await db.Schedule.findAll({
        include: [
            {
                model: db.Shift,
                as: "shift",
                attributes: ["shift_name", "start_time", "end_time"],
            },
            {
                model: db.ScheduleStaff,
                as: "registrations",
                include: [
                    {
                        model: db.User,
                        as: "scheduleStaffUser", // phải khớp alias trong model
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

// Lấy schedule theo ID
let getScheduleById = async (schedule_id) => {
    return await db.Schedule.findByPk(schedule_id, {
        include: [
            {
                association: db.Schedule.associations.registrations,
                include: [
                    db.ScheduleStaff.associations.scheduleStaffUser,
                    db.ScheduleStaff.associations.replacedBy,
                ],
            },
            db.Schedule.associations.shift,
        ],
    });
};

// Staff đăng ký ca
let registerSchedule = async (staff_id, shift_id, work_date) => {
    // 🔥 VALIDATE INPUT
    if (!staff_id) throw new Error("Missing staff_id");
    if (!shift_id) throw new Error("Missing shift_id");
    if (!work_date) throw new Error("Missing work_date");

    const schedule = await db.Schedule.findOne({
        where: {
            shift_id,
            work_date,
        },
    });

    if (!schedule) {
        throw new Error(
            `Schedule not found for shift_id=${shift_id}, work_date=${work_date}`
        );
    }

    // 2. Không cho đăng ký nếu closed
    if (schedule.status !== "open") {
        throw new Error("Shift is not open");
    }

    // 3. Không cho đăng ký ca quá khứ
    const today = new Date().setHours(0, 0, 0, 0);
    const workDate = new Date(work_date).setHours(0, 0, 0, 0);

    if (workDate < today) {
        throw new Error("Cannot register past shift");
    }

    // 4. Không cho đăng ký trùng user
    const existingRegistration = await db.ScheduleStaff.findOne({
        where: { staff_id, schedule_id: schedule.schedule_id },
    });

    if (existingRegistration) {
        if (["available", "confirmed"].includes(existingRegistration.status)) {
            throw new Error("Already registered");
        } else if (existingRegistration.status === "replaced") {
            throw new Error("You were registered but have been replaced");
        } else if (existingRegistration.status === "rejected") {
            throw new Error("Your previous registration was rejected");
        }
    }
    // 5. Check số lượng người
    const count = await db.ScheduleStaff.count({
        where: {
            schedule_id: schedule.schedule_id,
            status: { [Op.in]: ["available", "confirmed"] },
        },
    });

    if (count >= schedule.max_people) throw new Error("This shift is full");

    // 6. Tạo đăng ký
    return await db.ScheduleStaff.create({
        schedule_id: schedule.schedule_id,
        staff_id,
        status: "available",
    });
};

// Manager duyệt/reject
let approveSchedule = async (schedule_staff_id, action) => {
    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id);
    if (!reg) throw new Error("Registration not found");

    if (action === "confirmed") reg.status = "confirmed";
    else if (action === "rejected") reg.status = "rejected";
    else throw new Error("Invalid action");

    await reg.save();
    return reg;
};

// Manager chuyển ca
let replaceSchedule = async (schedule_staff_id, replacement_staff_id) => {
    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id);
    if (!reg) throw new Error("Registration not found");

    // Người B đã đăng ký ca này?
    const exists = await db.ScheduleStaff.findOne({
        where: {
            schedule_id: reg.schedule_id,
            staff_id: replacement_staff_id,
            status: { [Op.in]: ["available", "confirmed"] },
        },
    });

    if (exists) throw new Error("Replacement staff already has this shift");

    reg.status = "replaced";
    reg.replaced_by = replacement_staff_id;

    await reg.save();

    // Tạo dòng đăng ký mới cho người thay thế
    await db.ScheduleStaff.create({
        schedule_id: reg.schedule_id,
        staff_id: replacement_staff_id,
        status: "confirmed",
    });

    return reg;
};

// Update schedule
let updateSchedule = async (schedule_id, data) => {
    const schedule = await db.Schedule.findByPk(schedule_id);
    if (!schedule) throw new Error("Schedule not found");
    return await schedule.update(data);
};

// Delete schedule
let deleteSchedule = async (schedule_id) => {
    const schedule = await db.Schedule.findByPk(schedule_id);
    if (!schedule) throw new Error("Schedule not found");
    await schedule.destroy();
    return "Schedule deleted successfully";
};
// Manager tạo lịch cho một tuần
// shifts: mảng shift_id, max_people: số lượng tối đa cho từng shift
// startDate: ngày đầu tuần (thứ 2)
// numDays: số ngày muốn tạo (mặc định 7)
let createWeeklySchedule = async (
    startDate,
    shifts,
    maxPeople,
    numDays = 7
) => {
    try {
        // ===== VALIDATE INPUT =====
        if (!startDate) throw new Error("❌ Missing startDate");
        if (!Array.isArray(shifts) || shifts.length === 0)
            throw new Error("❌ shifts must be a non-empty array");
        if (!maxPeople || maxPeople <= 0)
            throw new Error("❌ maxPeople must be a positive number");

        // ===== CHECK SHIFT EXISTS =====
        const validShifts = await db.Shift.findAll({
            where: { shift_id: shifts },
        });

        if (validShifts.length !== shifts.length) {
            const validIds = validShifts.map((s) => s.shift_id);
            throw new Error(
                `❌ Some shift_id do not exist. Provided: [${shifts}], Valid: [${validIds}]`
            );
        }

        // ===== PARSE INPUT DATE =====
        const [year, month, day] = startDate.split("-").map(Number);
        let input = new Date(year, month - 1, day);

        // ===== FIND MONDAY OF THAT WEEK =====
        let dow = input.getDay(); // 1=Mon ... 0=Sun
        if (dow === 0) dow = 7;

        const monday = new Date(input);
        monday.setDate(input.getDate() - (dow - 1));

        // ===== BUILD 7 DAYS OF THE WEEK =====
        const dates = [];
        const formatLocal = (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;

        for (let i = 0; i < numDays; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(formatLocal(d));
        }

        // ===== SAVE TO DB (TRANSACTION) =====
        return await db.sequelize.transaction(async (t) => {
            const createdSchedules = [];

            for (const date of dates) {
                for (const shift_id of shifts) {
                    const exists = await db.Schedule.findOne({
                        where: { shift_id, work_date: date },
                        transaction: t,
                        lock: t.LOCK.UPDATE,
                    });

                    if (exists) {
                        console.log(
                            `⚠️ Schedule exists for date=${date}, shift=${shift_id}`
                        );
                        continue;
                    }

                    const schedule = await db.Schedule.create(
                        {
                            shift_id,
                            work_date: date,
                            max_people: maxPeople,
                            status: "closed",
                        },
                        { transaction: t }
                    );

                    createdSchedules.push(schedule);
                }
            }

            return createdSchedules;
        });
    } catch (err) {
        console.error("🔥 createWeeklySchedule ERROR:", err.message);
        throw err;
    }
};

let getMySchedule = async (staff_id) => {
    if (!staff_id) throw new Error("Invalid staff ID");

    try {
        const mySchedules = await db.ScheduleStaff.findAll({
            where: {
                staff_id,
                status: { [Op.in]: ["available", "confirmed"] },
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
                            attributes: [
                                "shift_name",
                                "start_time",
                                "end_time",
                            ],
                        },
                    ],
                },
                {
                    association: db.ScheduleStaff.associations.replacedBy,
                    attributes: ["user_id", "fullname"],
                },
            ],
            order: [
                [db.ScheduleStaff.associations.schedule, "work_date", "ASC"],
            ],
        });

        return {
            errCode: 0,
            data: mySchedules.map((item) => {
                const scheduleData = item.schedule || {};
                const shiftData = scheduleData.shift || {};
                return {
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
    } catch (error) {
        console.error("Lỗi tại getMySchedule Service:", error);
        throw error;
    }
};
let openWeeklySchedule = async (weekDate) => {
    if (!weekDate) throw new Error("Missing weekDate");

    const [y, m, d] = weekDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    // Lấy thứ (0 = Sunday)
    let dow = date.getDay();
    if (dow === 0) dow = 7; // Sunday → 7

    // ==== TÍNH MONDAY ====
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dow - 1));

    // ==== TÍNH SUNDAY ====
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Format YYYY-MM-DD (không dùng toISOString để tránh lệch ngày)
    const format = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;

    const start = format(monday);
    const end = format(sunday);

    console.log(`Opening schedules from ${start} → ${end}`);

    const [updatedCount] = await db.Schedule.update(
        { status: "open" },
        {
            where: {
                work_date: {
                    [db.Sequelize.Op.between]: [start, end],
                },
                status: "closed",
            },
        }
    );

    return {
        message: "Schedules opened successfully",
        week_start: start,
        week_end: end,
        updatedCount,
    };
};

export default {
    getAllSchedules,
    getScheduleById,
    registerSchedule,
    approveSchedule,
    replaceSchedule,
    updateSchedule,
    deleteSchedule,
    createWeeklySchedule,
    getMySchedule,
    openWeeklySchedule,
};
