import ScheduleService from "../services/ScheduleService.js";

// Lấy lịch của chính user (staff)
let getMySchedule = async (req, res) => {
    try {
        const result = await ScheduleService.getStaffSchedule(req.user.user_id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ message: e.toString() });
    }
};

// Lấy tất cả lịch (admin)
let getAllSchedules = async (req, res) => {
    try {
        const { staff_id, from, to, status } = req.query;
        const result = await ScheduleService.getAllSchedules({
            staff_id,
            fromDate: from,
            toDate: to,
            status,
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ message: e.toString() });
    }
};

// Tạo mới schedule
let createSchedule = async (req, res) => {
    try {
        const staff_id = req.user?.user_id || req.body.staff_id;
        const { schedules } = req.body;
        const result = await ScheduleService.createSchedule(
            staff_id,
            schedules
        );
        return res
            .status(201)
            .json({ message: "Schedules created successfully", result });
    } catch (e) {
        return res.status(400).json({ message: e.toString() });
    }
};

// Cập nhật work_status của schedule (staff)
let updateWorkStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { work_status, work_note } = req.body;
        const updated = await ScheduleService.updateWorkStatus(
            id,
            work_status,
            work_note
        );
        return res
            .status(200)
            .json({ message: "Updated successfully", updated });
    } catch (e) {
        return res.status(400).json({ message: e.toString() });
    }
};

// Cập nhật status của schedule (admin)
let updateScheduleStatusByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, work_note } = req.body;

        if (!["confirmed", "rejected", "cancelled"].includes(status)) {
            throw new Error("Invalid status value");
        }

        const updated = await ScheduleService.updateStatusByAdmin(
            id,
            status,
            work_note
        );

        return res.status(200).json({
            message:
                status === "confirmed"
                    ? "Schedule confirmed successfully"
                    : status === "rejected"
                    ? "Schedule rejected"
                    : "Schedule cancelled",
            updated,
        });
    } catch (e) {
        return res.status(400).json({ message: e.toString() });
    }
};

// Xóa schedule
let deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ScheduleService.deleteSchedule(id);
        return res.status(200).json({ message: result });
    } catch (e) {
        return res.status(400).json({ message: e.toString() });
    }
};

export default {
    getMySchedule,
    getAllSchedules,
    createSchedule,
    updateWorkStatus,
    updateScheduleStatusByAdmin,
    deleteSchedule,
};
