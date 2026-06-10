import reportService from "../services/reportService.js";

const exportReport = async (req, res) => {
    try {
        const { period = "day" } = req.query;

        const workbook = await reportService.exportRevenueReport(period);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="revenue_report.xlsx"',
        );

        await workbook.xlsx.write(res);

        res.end();
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            errCode: -1,
            errMessage: "Export report failed",
        });
    }
};

export default {
    exportReport,
};
