import db from "../models/index.js";
import { Op } from "sequelize";



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


let registerSchedule = async (staff_id, shift_id, work_date) => {
    
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
            `Schedule not found for shift_id=${shift_id}, work_date=${work_date}`,
        );
    }

    
    if (schedule.status !== "open") {
        throw new Error("Shift is not open");
    }

    
    const today = new Date().setHours(0, 0, 0, 0);
    const workDate = new Date(work_date).setHours(0, 0, 0, 0);

    if (workDate < today) {
        throw new Error("Cannot register past shift");
    }

    
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
    
    const count = await db.ScheduleStaff.count({
        where: {
            schedule_id: schedule.schedule_id,
            status: { [Op.in]: ["available", "confirmed"] },
        },
    });

    if (count >= schedule.max_people) throw new Error("This shift is full");

    
    return await db.ScheduleStaff.create({
        schedule_id: schedule.schedule_id,
        staff_id,
        status: "available",
    });
};


let approveSchedule = async (schedule_staff_id, action) => {
    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id);
    if (!reg) throw new Error("Registration not found");

    if (action === "confirmed") reg.status = "confirmed";
    else if (action === "rejected") reg.status = "rejected";
    else throw new Error("Invalid action");

    await reg.save();
    return reg;
};


let replaceSchedule = async (schedule_staff_id, replacement_staff_id) => {
    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id);
    if (!reg) throw new Error("Registration not found");

    
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

    
    await db.ScheduleStaff.create({
        schedule_id: reg.schedule_id,
        staff_id: replacement_staff_id,
        status: "confirmed",
    });

    return reg;
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
    numDays = 7,
) => {
    try {
        
        if (!startDate) throw new Error("❌ Missing startDate");
        if (!Array.isArray(shifts) || shifts.length === 0)
            throw new Error("❌ shifts must be a non-empty array");
        if (!maxPeople || maxPeople <= 0)
            throw new Error("❌ maxPeople must be a positive number");

        
        const validShifts = await db.Shift.findAll({
            where: { shift_id: shifts },
        });

        if (validShifts.length !== shifts.length) {
            const validIds = validShifts.map((s) => s.shift_id);
            throw new Error(
                `❌ Some shift_id do not exist. Provided: [${shifts}], Valid: [${validIds}]`,
            );
        }

        
        const [year, month, day] = startDate.split("-").map(Number);
        let input = new Date(year, month - 1, day);

        
        let dow = input.getDay(); 
        if (dow === 0) dow = 7;

        const monday = new Date(input);
        monday.setDate(input.getDate() - (dow - 1));

        
        const dates = [];
        const formatLocal = (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
                2,
                "0",
            )}-${String(d.getDate()).padStart(2, "0")}`;

        for (let i = 0; i < numDays; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(formatLocal(d));
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

                    if (exists) {
                        console.log(
                            `⚠️ Schedule exists for date=${date}, shift=${shift_id}`,
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
                        { transaction: t },
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

    
    let dow = date.getDay();
    if (dow === 0) dow = 7; 

    
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dow - 1));

    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    
    const format = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0",
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

    const [y, m, d] = weekDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    let dow = date.getDay();
    if (dow === 0) dow = 7;

    const monday = new Date(date);
    monday.setDate(date.getDate() - (dow - 1));

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (dt) =>
        `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
            dt.getDate(),
        ).padStart(2, "0")}`;

    const start = format(monday);
    const end = format(sunday);

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
    getSchedulesByWeek,
};
