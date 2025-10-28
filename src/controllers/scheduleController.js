import ScheduleService from "../services/ScheduleService.js";

const scheduleController = {
    async getMySchedule(req, res) {
        try {
            const result = await ScheduleService.getStaffSchedule(
                req.user.user_id
            );
            res.json(result);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    async getAll(req, res) {
        try {
            const { staff_id, from, to } = req.query;
            const result = await ScheduleService.getAllSchedules({
                staff_id,
                from,
                to,
            });
            res.json(result);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { work_status, work_note } = req.body;
            const updated = await ScheduleService.updateWorkStatus(
                id,
                work_status,
                work_note
            );
            res.json({ message: "Updated", updated });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    async create(req, res) {
        try {
            const staff_id =
                req.user?.user_id || "eyBn3ahNHFgj3FbMhm3SuwZWUMw2";
            const { schedules } = req.body;
            const result = await ScheduleService.createSchedule(
                staff_id,
                schedules
            );
            res.json({ message: "Schedules created successfully", result });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    async updateScheduleStatusByAdmin(req, res) {
        try {
            const { id } = req.params; // id của schedule
            const { status, work_note } = req.body; // "confirmed" hoặc "rejected"
            console.log("Received status:", status);
            if (!["confirmed", "rejected", "cancelled"].includes(status)) {
                throw new Error("Invalid status value");
            }

            const updated = await ScheduleService.updateStatusByAdmin(
                id,
                status,
                work_note
            );

            res.json({
                message:
                    status === "confirmed"
                        ? "Schedule confirmed successfully"
                        : "Schedule rejected",
                updated,
            });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
};

export default scheduleController;
