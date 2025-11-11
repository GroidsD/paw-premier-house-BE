import ShiftService from "../services/ShiftService.js";

// Lấy tất cả ca làm
let getAllShifts = async (req, res) => {
    try {
        const shifts = await ShiftService.getAllShifts();
        return res.status(200).json(shifts);
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};

// Lấy ca làm theo ID
let getShiftById = async (req, res) => {
    try {
        const { id } = req.params;
        const shift = await ShiftService.getShiftById(id);
        if (!shift) return res.status(404).json({ message: "Shift not found" });
        return res.status(200).json(shift);
    } catch (err) {
        return res.status(500).json({ message: err.toString() });
    }
};

// Tạo ca làm mới
let createShift = async (req, res) => {
    try {
        const newShift = await ShiftService.createShift(req.body);
        return res.status(201).json(newShift);
    } catch (err) {
        return res.status(400).json({ message: err.toString() });
    }
};

// Cập nhật ca làm
let updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await ShiftService.updateShift(id, req.body);
        if (!updated)
            return res.status(404).json({ message: "Shift not found" });
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(400).json({ message: err.toString() });
    }
};

// Xóa ca làm
let deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ShiftService.deleteShift(id);
        if (!result)
            return res.status(404).json({ message: "Shift not found" });
        return res.status(200).json({ message: "Shift deleted successfully" });
    } catch (err) {
        return res.status(400).json({ message: err.toString() });
    }
};

export default {
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
};
