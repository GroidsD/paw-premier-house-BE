const ScheduleService = require("../services/ScheduleService");

exports.getMySchedule = async (req, res) => {
    try {
        const result = await ScheduleService.getStaffSchedule(req.user.user_id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAll = async (req, res) => {
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
};

exports.updateStatus = async (req, res) => {
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
};
