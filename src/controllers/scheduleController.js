import ScheduleService from "../services/ScheduleService.js";

// Lấy tất cả
let getAll = async (req, res) => {
    try {
        const schedules = await ScheduleService.getAllSchedules();
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy theo ID
let getById = async (req, res) => {
    try {
        const schedule = await ScheduleService.getScheduleById(
            req.params.schedule_id
        );
        if (!schedule)
            return res.status(404).json({ message: "Schedule not found" });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Staff đăng ký
let register = async (req, res) => {
    try {
        if (req.user.role !== "staff")
            return res
                .status(403)
                .json({ message: "Only staff can register shifts" });

        const { shift_id, work_date } = req.body;

        if (!shift_id || !work_date)
            return res
                .status(400)
                .json({ message: "shift_id and work_date are required" });

        const schedule = await ScheduleService.registerSchedule(
            req.user.user_id,
            shift_id,
            work_date
        );

        res.status(201).json({ message: "Registered successfully", schedule });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Manager duyệt/reject
let approve = async (req, res) => {
    try {
        if (!["admin", "manager"].includes(req.user.role))
            return res.status(403).json({ message: "Permission denied" });

        const schedule = await ScheduleService.approveSchedule(
            req.params.schedule_id,
            req.body.action
        );
        res.json(schedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Manager chuyển ca
let replace = async (req, res) => {
    try {
        if (!["admin", "manager"].includes(req.user.role))
            return res.status(403).json({ message: "Permission denied" });

        const schedule = await ScheduleService.replaceSchedule(
            req.params.schedule_id,
            req.body.replacement_staff_id
        );
        res.json(schedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update & Delete
let update = async (req, res) => {
    try {
        const updated = await ScheduleService.updateSchedule(
            req.params.schedule_id,
            req.body
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let remove = async (req, res) => {
    try {
        const result = await ScheduleService.deleteSchedule(
            req.params.schedule_id
        );
        res.json({ message: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// POST /api/schedules/create-weekly
let createWeekly = async (req, res) => {
    try {
        // console.log("Body:", req.body);
        // console.log("start_date:", req.body.start_date);

        if (!["admin", "manager"].includes(req.user.role))
            return res.status(403).json({ message: "Permission denied" });

        const { start_date, shifts, max_people } = req.body;
        // shifts: [1,2,3] - các shift_id
        // max_people: số lượng tối đa cho mỗi shift mỗi ngày

        const schedules = await ScheduleService.createWeeklySchedule(
            start_date,
            shifts,
            max_people
        );
        res.status(201).json(schedules);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let getMySchedule = async (req, res) => {
    try {
        const staff_id = req.user.user_id; // Lấy từ token

        // ✅ ĐÚNG: Gọi ScheduleService (viết Hoa giống import)
        const result = await ScheduleService.getMySchedule(staff_id);

        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: e.message });
    }
};
export default {
    getAll,
    getById,
    register,
    approve,
    replace,
    update,
    delete: remove,
    createWeekly,
    getMySchedule,
};
