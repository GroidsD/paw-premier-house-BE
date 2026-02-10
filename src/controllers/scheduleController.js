import ScheduleService from "../services/ScheduleService.js";

let getAll = async (req, res) => {
    try {
        const schedules = await ScheduleService.getAllSchedules();
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

let getById = async (req, res) => {
    try {
        const schedule = await ScheduleService.getScheduleById(
            req.params.schedule_id,
        );
        if (!schedule)
            return res.status(404).json({ message: "Schedule not found" });
        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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
            work_date,
        );

        res.status(201).json({ message: "Registered successfully", schedule });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let approve = async (req, res) => {
    try {
        if (!["admin", "manager"].includes(req.user.role))
            return res.status(403).json({ message: "Permission denied" });

        const { schedule_staff_id } = req.params;
        const { action } = req.body;

        const result = await ScheduleService.approveSchedule(
            schedule_staff_id,
            action,
        );

        res.json({
            message: "Updated successfully",
            data: result,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let replace = async (req, res) => {
    try {
        if (!["admin", "manager"].includes(req.user.role))
            return res.status(403).json({ message: "Permission denied" });

        const schedule = await ScheduleService.replaceSchedule(
            req.params.schedule_staff_id,
            req.body.replacement_staff_id,
        );
        res.json(schedule);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let update = async (req, res) => {
    try {
        const updated = await ScheduleService.updateSchedule(
            req.params.schedule_id,
            req.body,
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let remove = async (req, res) => {
    try {
        const result = await ScheduleService.deleteSchedule(
            req.params.schedule_id,
        );
        res.json({ message: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
let createWeekly = async (req, res) => {
    try {
        const { start_date, shifts, max_people } = req.body;

        const schedules = await ScheduleService.createWeeklySchedule(
            start_date,
            shifts,
            max_people,
        );
        res.status(201).json(schedules);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let getMySchedule = async (req, res) => {
    try {
        const staff_id = req.user.user_id;

        const result = await ScheduleService.getMySchedule(staff_id);

        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: e.message });
    }
};
let openWeekSchedules = async (req, res) => {
    try {
        const { week } = req.query;
        const result = await ScheduleService.openWeeklySchedule(week);

        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({
            error: err.message,
        });
    }
};
let getSchedulesByWeek = async (req, res) => {
    try {
        const { week } = req.query;
        const data = await ScheduleService.getSchedulesByWeek(week);
        return res.status(200).json({ errCode: 0, data });
    } catch (e) {
        return res.status(400).json({
            errCode: 1,
            message: e.message || "Get schedules by week failed",
        });
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
    openWeekSchedules,
    getSchedulesByWeek,
};
