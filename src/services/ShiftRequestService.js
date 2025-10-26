const { ShiftRequest, Schedule, WorkDate, Shift } = require("../models");
const { Op } = require("sequelize");
const { startOfWeek, endOfWeek } = require("date-fns");

module.exports = {
    // async createRequest(staff_id, date_or_id, shift_id) {
    //     // 🧩 B1. Xử lý đầu vào: có thể là date_id hoặc date string
    //     let workDate;

    //     if (isNaN(date_or_id)) {
    //         // Nếu truyền vào là string ngày (VD: "2025-10-28")
    //         workDate = await WorkDate.findOne({
    //             where: { work_date: date_or_id },
    //         });
    //         if (!workDate) {
    //             workDate = await WorkDate.create({ work_date: date_or_id });
    //         }
    //     } else {
    //         // Nếu truyền vào là id
    //         workDate = await WorkDate.findByPk(date_or_id);
    //         if (!workDate) throw new Error("Work date not found");
    //     }

    //     // 🧩 B2. Kiểm tra staff đã đăng ký ca đó chưa
    //     const exist = await ShiftRequest.findOne({
    //         where: {
    //             staff_id,
    //             date_id: workDate.work_date_id,
    //             shift_id,
    //         },
    //     });
    //     if (exist) throw new Error("You already requested this shift");

    //     // 🧩 B3. Tính tổng số giờ đã làm/được duyệt trong tuần
    //     const weekStart = startOfWeek(new Date(workDate.work_date));
    //     const weekEnd = endOfWeek(new Date(workDate.work_date));

    //     // Lấy tất cả Schedule đã duyệt trong tuần
    //     const schedules = await Schedule.findAll({
    //         where: { staff_id },
    //         include: [
    //             {
    //                 model: WorkDate,
    //                 where: {
    //                     work_date: { [Op.between]: [weekStart, weekEnd] },
    //                 },
    //             },
    //             { model: Shift },
    //         ],
    //     });

    //     // Tổng giờ đã làm
    //     const totalHours = schedules.reduce(
    //         (sum, s) => sum + (s.Shift?.duration_hours || 0),
    //         0
    //     );

    //     // Giờ của ca đang muốn đăng ký
    //     const shift = await Shift.findByPk(shift_id);
    //     if (!shift) throw new Error("Shift not found");

    //     if (totalHours + shift.duration_hours > 40) {
    //         throw new Error(
    //             "Cannot register more than 40 working hours per week"
    //         );
    //     }

    //     // 🧩 B4. Tạo request mới
    //     const request = await ShiftRequest.create({
    //         staff_id,
    //         date_id: workDate.id,
    //         shift_id,
    //         status: "pending",
    //     });

    //     return request;
    // },
    async createRequest(staff_id, date_or_id, shift_id) {
        let workDate;

        if (isNaN(date_or_id)) {
            workDate = await WorkDate.findOne({
                where: { work_date: date_or_id },
            });
            if (!workDate) {
                workDate = await WorkDate.create({ work_date: date_or_id });
            }
        } else {
            workDate = await WorkDate.findByPk(date_or_id);
            if (!workDate) throw new Error("Work date not found");
        }

        // Kiểm tra request trùng
        const exist = await ShiftRequest.findOne({
            where: {
                staff_id,
                work_date_id: workDate.work_date_id, // ✅ fixed
                shift_id,
            },
        });
        if (exist) throw new Error("You already requested this shift");

        const weekStart = startOfWeek(new Date(workDate.work_date));
        const weekEnd = endOfWeek(new Date(workDate.work_date));

        const schedules = await Schedule.findAll({
            where: { staff_id },
            include: [
                {
                    model: WorkDate,
                    where: {
                        work_date: { [Op.between]: [weekStart, weekEnd] },
                    },
                },
                { model: Shift },
            ],
        });

        const totalHours = schedules.reduce(
            (sum, s) => sum + (s.Shift?.duration_hours || 0),
            0
        );

        const shift = await Shift.findByPk(shift_id);
        if (!shift) throw new Error("Shift not found");

        if (totalHours + shift.duration_hours > 40) {
            throw new Error(
                "Cannot register more than 40 working hours per week"
            );
        }

        const request = await ShiftRequest.create({
            staff_id,
            work_date_id: workDate.work_date_id, // ✅ fixed
            shift_id,
            status: "pending",
        });

        return request;
    },
    async getPendingRequests() {
        return await ShiftRequest.findAll({
            where: { status: "pending" },
            include: [WorkDate, Shift],
        });
    },

    async approveRequest(request_id, admin_id) {
        const req = await ShiftRequest.findByPk(request_id);
        if (!req) throw new Error("Request not found");

        await req.update({ status: "approved", approved_by: admin_id });

        // tạo lịch làm chính thức
        await Schedule.create({
            staff_id: req.staff_id,
            work_date_id: req.work_date_id,
            shift_id: req.shift_id,
            status: "confirmed",
        });

        return req;
    },

    async rejectRequest(request_id) {
        const req = await ShiftRequest.findByPk(request_id);
        if (!req) throw new Error("Request not found");
        await req.update({ status: "rejected" });
        return req;
    },
};
