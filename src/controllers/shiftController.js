// const ShiftService = require("../services/ShiftService");

// exports.getAll = async (req, res) => {
//     try {
//         const shifts = await ShiftService.getAllShifts();
//         res.json(shifts);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// exports.create = async (req, res) => {
//     try {
//         const newShift = await ShiftService.createShift(req.body);
//         res.status(201).json(newShift);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// };
