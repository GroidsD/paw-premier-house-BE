import ShiftService from "../services/ShiftService.js";

let getAll = async (req, res) => {
    try {
        const shifts = await ShiftService.getAllShifts();
        res.json(shifts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

let getById = async (req, res) => {
    try {
        const shift = await ShiftService.getShiftById(req.params.shift_id);
        if (!shift) return res.status(404).json({ message: "Shift not found" });
        res.json(shift);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

let create = async (req, res) => {
    try {
        const newShift = await ShiftService.createShift(req.body);
        res.status(201).json(newShift);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let update = async (req, res) => {
    try {
        const updatedShift = await ShiftService.updateShift(
            req.params.shift_id,
            req.body,
        );
        res.json(updatedShift);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

let remove = async (req, res) => {
    try {
        const result = await ShiftService.deleteShift(req.params.shift_id);
        res.json({ message: result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export default {
    getAll,
    getById,
    create,
    update,
    delete: remove,
};
