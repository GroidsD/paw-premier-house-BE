const db = require("../models");

// Lấy tất cả ca làm việc
let getAllShifts = async () => {
    return await db.Shift.findAll({ order: [["start_time", "ASC"]] });
};

// Lấy ca theo ID
let getShiftById = async (shift_id) => {
    return await db.Shift.findByPk(shift_id);
};

// Tạo ca mới
let createShift = async (data) => {
    const { shift_name, start_time, end_time, duration_hours } = data;

    if (!shift_name || !start_time || !end_time || !duration_hours) {
        throw new Error("Missing required fields");
    }

    // Check trùng ca theo shift_name + start_time + end_time
    const existingShift = await db.Shift.findOne({
        where: { shift_name, start_time, end_time },
    });

    if (existingShift) {
        throw new Error("Shift already exists with the same name and time");
    }

    return await db.Shift.create({
        shift_name,
        start_time,
        end_time,
        duration_hours,
    });
};

// Cập nhật ca
let updateShift = async (shift_id, data) => {
    const shift = await db.Shift.findByPk(shift_id);
    if (!shift) throw new Error("Shift not found");

    return await shift.update(data);
};

// Xóa ca
let deleteShift = async (shift_id) => {
    const shift = await db.Shift.findByPk(shift_id);
    if (!shift) throw new Error("Shift not found");

    await shift.destroy();
    return "Shift deleted successfully";
};

// Export tất cả methods
export default {
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
};
