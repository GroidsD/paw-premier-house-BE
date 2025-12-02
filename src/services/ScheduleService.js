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
                // Thay vì include User trực tiếp, hãy include bảng trung gian
                model: db.ScheduleStaff,
                as: "registrations", // Alias defined in Schedule.hasMany
                include: [
                    {
                        model: db.User,
                        as: "staff", // Nhân viên đăng ký ban đầu
                        attributes: ["user_id", "fullname", "email"],
                    },
                    {
                        model: db.User,
                        as: "replacedBy", // Nhân viên thay thế (nếu có)
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
                model: db.User,
                as: "staff",
                attributes: ["user_id", "fullname", "email"],
            },
            {
                model: db.User,
                as: "replacement",
                attributes: ["user_id", "fullname"],
            },
            { model: db.Shift },
        ],
    });
};

// Staff đăng ký ca
let registerSchedule = async (staff_id, schedule_id) => {
    // 1. Check schedule exists
    const schedule = await db.Schedule.findByPk(schedule_id);

    if (!schedule) throw new Error("Schedule not found");

    // 2. Check staff already registered?
    const existing = await db.ScheduleStaff.findOne({
        where: { staff_id, schedule_id },
    });

    if (existing) throw new Error("You already registered this shift");

    // 3. Check slot still available
    const count = await db.ScheduleStaff.count({
        where: { schedule_id, status: ["pending", "confirmed"] },
    });

    if (count >= schedule.max_people) throw new Error("This shift is full");

    // 4. Create registration
    return await db.ScheduleStaff.create({
        schedule_id,
        staff_id,
        status: "pending",
    });
};

// Manager duyệt/reject
let approveSchedule = async (schedule_staff_id, action) => {
    const reg = await db.ScheduleStaff.findByPk(schedule_staff_id);
    if (!reg) throw new Error("Registration not found");

    if (action === "approve") reg.status = "confirmed";
    else if (action === "reject") reg.status = "rejected";
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
            status: ["pending", "confirmed"],
        },
    });

    if (exists) throw new Error("Replacement staff already has this shift");

    reg.status = "rejected"; // hoặc "replaced"
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
    const dates = [];
    if (!startDate) throw new Error("startDate is required");
    const [year, month, day] = startDate.split("-").map(Number);

    const start = new Date(year, month - 1, day); // month -1 vì Date tháng từ 0-11

    for (let i = 0; i < numDays; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        dates.push(`${yyyy}-${mm}-${dd}`);
    }

    return await db.sequelize.transaction(async (t) => {
        const createdSchedules = [];

        for (const date of dates) {
            for (const shift_id of shifts) {
                // Check đã có schedule cho shift + date chưa
                const exists = await db.Schedule.findOne({
                    where: { shift_id, work_date: date },
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!exists) {
                    const schedule = await db.Schedule.create(
                        {
                            shift_id,
                            work_date: date,
                            max_people: maxPeople,
                            status: "open",
                        },
                        { transaction: t }
                    );
                    createdSchedules.push(schedule);
                }
            }
        }

        return createdSchedules;
    });
};
let getMySchedule = async (staff_id) => {
    // 1. Validate đầu vào
    if (!staff_id) throw new Error("Invalid staff ID");

    try {
        // 2. Query Database
        const mySchedules = await db.ScheduleStaff.findAll({
            where: {
                staff_id: staff_id,
                status: { [Op.in]: ["pending", "confirmed"] },
            },

            include: [
                {
                    model: db.Schedule,
                    as: "schedule", // Khớp với ScheduleStaff.belongsTo(Schedule)
                    attributes: [
                        "schedule_id",
                        "work_date",
                        "status",
                        "max_people",
                    ],
                    include: [
                        {
                            model: db.Shift,
                            as: "shift", // Khớp với Schedule.belongsTo(Shift)
                            attributes: [
                                "shift_name",
                                "start_time",
                                "end_time",
                            ],
                        },
                    ],
                },
                {
                    model: db.User,
                    as: "replacedBy", // Khớp với ScheduleStaff.belongsTo(User, as: replacedBy)
                    attributes: ["user_id", "fullname"],
                },
            ],
            // Sắp xếp theo ngày làm việc (chỉ chạy được khi có include ở trên)
            order: [
                [{ model: db.Schedule, as: "schedule" }, "work_date", "ASC"],
            ],
        });

        // 3. Format dữ liệu trả về cho đẹp
        return {
            errCode: 0,
            data: mySchedules.map((item) => {
                const scheduleData = item.schedule || {};
                const shiftData = scheduleData.shift || {};

                return {
                    // registration_id: item.schedule_staff_id,
                    schedule_id: scheduleData.schedule_id, // ID của lịch
                    status: item.status,
                    work_date: scheduleData.work_date,
                    shift_name: shiftData.shift_name,
                    start_time: shiftData.start_time,
                    end_time: shiftData.end_time,
                    replaced_by: item.replacedBy,
                };
            }),
        };
    } catch (error) {
        console.error("Lỗi tại getMySchedule Service:", error); // Xem log này trong terminal nếu lỗi
        throw error;
    }
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
};
