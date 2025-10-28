const ShiftRequestService = require("../services/ShiftRequestService");

exports.create = async (req, res) => {
    try {
        const { date_id, shift_id } = req.body;
        const staff_id = req.user.user_id;
        const result = await ShiftRequestService.createRequest(
            staff_id,
            date_id,
            shift_id
        );
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getPending = async (req, res) => {
    try {
        const list = await ShiftRequestService.getPendingRequests();
        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        const { id } = req.params;
        const admin_id = req.user.user_id;
        const result = await ShiftRequestService.approveRequest(id, admin_id);
        res.json({ message: "Approved", result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.reject = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ShiftRequestService.rejectRequest(id);
        res.json({ message: "Rejected", result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
