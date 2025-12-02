const db = require("../models");

exports.getAllShifts = async () => {
    return await db.Shift.findAll({ order: [["start_time", "ASC"]] });
};

exports.getShiftById = async (shift_id) => {
    return await db.Shift.findByPk(shift_id);
};

exports.createShift = async (data) => {
    if (
        !data.shift_name ||
        !data.start_time ||
        !data.end_time ||
        !data.duration_hours
    ) {
        throw new Error("Missing required fields");
    }

    return await db.Shift.create(data);
};

exports.updateShift = async (shift_id, data) => {
    const shift = await db.Shift.findByPk(shift_id);
    if (!shift) throw new Error("Shift not found");

    return await shift.update(data);
};

exports.deleteShift = async (shift_id) => {
    const shift = await db.Shift.findByPk(shift_id);
    if (!shift) throw new Error("Shift not found");

    await shift.destroy();
    return "Shift deleted successfully";
};
