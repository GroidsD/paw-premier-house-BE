// const { Shift } = require("../models");

// module.exports = {
//     async getAllShifts() {
//         return await Shift.findAll();
//     },

//     async createShift(data) {
//         // Kiểm tra trùng theo name + giờ bắt đầu + giờ kết thúc
//         const exist = await Shift.findOne({
//             where: {
//                 name: data.name,
//                 start_time: data.start_time,
//                 end_time: data.end_time,
//             },
//         });

//         if (exist) {
//             throw new Error("Shift with the same name and time already exists");
//         }

//         return await Shift.create(data);
//     },
//     async updateShift(id, data) {
//         const shift = await Shift.findByPk(id);
//         if (!shift) throw new Error("Shift not found");
//         return await shift.update(data);
//     },

//     async deleteShift(id) {
//         const shift = await Shift.findByPk(id);
//         if (!shift) throw new Error("Shift not found");
//         await shift.destroy();
//         return true;
//     },
// };
