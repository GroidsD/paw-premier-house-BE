import db from "../models/index.js";
import ExcelJS from "exceljs";
import { Op } from "sequelize";

const exportRevenueReport = async (period) => {
    const now = new Date();

    let startDate = new Date();

    switch (period) {
        case "day":
            startDate.setHours(0, 0, 0, 0);
            break;

        case "week":
            startDate.setDate(now.getDate() - 7);
            break;

        case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;

        case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;

        default:
            startDate.setHours(0, 0, 0, 0);
    }

    const transactions = await db.RevenueTransaction.findAll({
        where: {
            transaction_date: {
                [Op.between]: [startDate, now],
            },
        },
        order: [["transaction_date", "DESC"]],
        raw: true,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Revenue Report");

    worksheet.columns = [
        { header: "Revenue ID", key: "revenue_id", width: 15 },
        { header: "Source Type", key: "source_type", width: 15 },
        { header: "Order ID", key: "order_id", width: 15 },
        { header: "Booking ID", key: "booking_id", width: 15 },
        { header: "Transaction Type", key: "transaction_type", width: 20 },
        { header: "Gross Amount", key: "gross_amount", width: 18 },
        { header: "Discount Amount", key: "discount_amount", width: 18 },
        { header: "Net Amount", key: "net_amount", width: 18 },
        { header: "Status", key: "status", width: 15 },
        { header: "Transaction Date", key: "transaction_date", width: 25 },
        { header: "Note", key: "note", width: 50 },
    ];

    // Style header
    worksheet.getRow(1).font = {
        bold: true,
        color: { argb: "FFFFFF" },
    };

    worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
    };

    transactions.forEach((item) => {
        worksheet.addRow({
            ...item,
            order_id: item.order_id || "",
            booking_id: item.booking_id || "",
        });
    });

    return workbook;
};

export default {
    exportRevenueReport,
};
