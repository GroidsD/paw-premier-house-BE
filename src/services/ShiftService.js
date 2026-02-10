const db = require("../models");
const calculateDuration = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startM = sh * 60 + sm;
    let endM = eh * 60 + em;

    
    if (endM <= startM) endM += 24 * 60;

    return (endM - startM) / 60; 
};


let getAllShifts = async () => {
    return await db.Shift.findAll({ order: [["start_time", "ASC"]] });
};


let getShiftById = async (shift_id) => {
    return await db.Shift.findByPk(shift_id);
};


let createShift = async (data) => {
    const { shift_name, start_time, end_time } = data;

    if (!shift_name || !start_time || !end_time) {
        throw new Error(
            "Missing required fields (shift_name, start_time, end_time)"
        );
    }

    
    const duration_hours = calculateDuration(start_time, end_time);

    
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


let updateShift = async (shift_id, data) => {
    const shift = await db.Shift.findByPk(shift_id);
    if (!shift) throw new Error("Shift not found");

    
    let newData = { ...data };

    if (data.start_time || data.end_time) {
        const start = data.start_time || shift.start_time;
        const end = data.end_time || shift.end_time;
        newData.duration_hours = calculateDuration(start, end);
    }

    return await shift.update(newData);
};


let deleteShift = async (shift_id) => {
    const shift = await db.Shift.findByPk(shift_id);
    if (!shift) throw new Error("Shift not found");

    await shift.destroy();
    return "Shift deleted successfully";
};


export default {
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
};
