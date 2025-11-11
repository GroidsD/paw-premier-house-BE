import db from "../models/index.js";

let getAllShifts = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const shifts = await db.Shift.findAll({
                order: [["shift_id", "ASC"]],
            });
            resolve(shifts);
        } catch (e) {
            reject(e);
        }
    });
};

let getShiftById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const shift = await db.Shift.findByPk(id);
            if (!shift) return reject("Shift not found");
            resolve(shift);
        } catch (e) {
            reject(e);
        }
    });
};

let createShift = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const exist = await db.Shift.findOne({
                where: {
                    name: data.name,
                    start_time: data.start_time,
                    end_time: data.end_time,
                },
            });

            if (exist)
                return reject(
                    "Shift with the same name and time already exists"
                );

            const shift = await db.Shift.create(data);
            resolve(shift);
        } catch (e) {
            reject(e);
        }
    });
};

let updateShift = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const shift = await db.Shift.findByPk(id);
            if (!shift) return reject("Shift not found");

            await shift.update(data);
            resolve(shift);
        } catch (e) {
            reject(e);
        }
    });
};

let deleteShift = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const shift = await db.Shift.findByPk(id);
            if (!shift) return reject("Shift not found");

            await shift.destroy();
            resolve("Shift deleted successfully");
        } catch (e) {
            reject(e);
        }
    });
};

export default {
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
};
