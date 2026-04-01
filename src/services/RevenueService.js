import db from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const ALLOWED_GROUPS = ["day", "week", "month", "year"];

const normalizeGroupBy = (groupBy = "day") =>
    ALLOWED_GROUPS.includes(groupBy) ? groupBy : "day";

const getStartOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const getEndOfToday = () => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
};

const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(now);
    start.setDate(now.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getEndOfWeek = () => {
    const start = getStartOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
};

const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

const getEndOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
};

const getStartOfYear = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
};

const getEndOfYear = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
};

const getDateRangeByGroup = (groupBy = "day") => {
    const safe = normalizeGroupBy(groupBy);

    if (safe === "week") {
        return { startDate: getStartOfWeek(), endDate: getEndOfWeek() };
    }
    if (safe === "month") {
        return { startDate: getStartOfMonth(), endDate: getEndOfMonth() };
    }
    if (safe === "year") {
        return { startDate: getStartOfYear(), endDate: getEndOfYear() };
    }

    return { startDate: getStartOfToday(), endDate: getEndOfToday() };
};

const getChartRangeStartDate = (groupBy = "day") => {
    const safeGroupBy = normalizeGroupBy(groupBy);
    const now = new Date();

    if (safeGroupBy === "day") {
        const start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    if (safeGroupBy === "week") {
        const start = new Date(getStartOfWeek());
        start.setDate(start.getDate() - 7 * 7);
        return start;
    }

    if (safeGroupBy === "month") {
        return new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);
    }

    return new Date(now.getFullYear() - 4, 0, 1, 0, 0, 0, 0);
};

const getRevenueSummary = async (groupBy = "day") => {
    const { startDate, endDate } = getDateRangeByGroup(groupBy);

    const [totalRevenue, currentRevenue] = await Promise.all([
        db.RevenueTransaction.sum("net_amount", {
            where: { status: "recorded" },
        }),
        db.RevenueTransaction.sum("net_amount", {
            where: {
                status: "recorded",
                transaction_date: {
                    [Op.between]: [startDate, endDate],
                },
            },
        }),
    ]);

    const [
        totalOrdersCompleted,
        totalBookingsCompleted,
        cancelledOrders,
        cancelledBookings,
    ] = await Promise.all([
        db.Order.count({ where: { status: "completed" } }),
        db.Booking.count({ where: { status: "completed" } }),
        db.Order.count({ where: { status: "cancelled" } }),
        db.Booking.count({ where: { status: "cancelled" } }),
    ]);

    return {
        totalRevenue: Number(totalRevenue || 0),
        currentRevenue: Number(currentRevenue || 0),
        totalOrdersCompleted,
        totalBookingsCompleted,
        cancelledOrders,
        cancelledBookings,
    };
};

const getRevenueByPeriod = async (groupBy = "day") => {
    const safeGroupBy = normalizeGroupBy(groupBy);
    const startDate = getChartRangeStartDate(safeGroupBy);
    const now = new Date();

    let formatExpr;
    let orderExpr;
    const labelAlias = "label";

    // --- FIX LỖI GROUP BY TẠI ĐÂY ---
    if (safeGroupBy === "week") {
        formatExpr = fn("DATE_FORMAT", col("transaction_date"), "%x-W%v");
        // Sử dụng hàm tổng hợp MIN() để tương thích với chế độ only_full_group_by của MySQL
        orderExpr = fn("YEARWEEK", fn("MIN", col("transaction_date")), 3);
    } else if (safeGroupBy === "month") {
        formatExpr = fn("DATE_FORMAT", col("transaction_date"), "%Y-%m");
        orderExpr = literal(labelAlias);
    } else if (safeGroupBy === "year") {
        formatExpr = fn("DATE_FORMAT", col("transaction_date"), "%Y");
        orderExpr = literal(labelAlias);
    } else {
        formatExpr = fn("DATE_FORMAT", col("transaction_date"), "%Y-%m-%d");
        orderExpr = literal(labelAlias);
    }

    const rows = await db.RevenueTransaction.findAll({
        attributes: [
            [formatExpr, labelAlias],
            [
                fn(
                    "SUM",
                    literal(
                        `CASE WHEN source_type = 'order' THEN net_amount ELSE 0 END`,
                    ),
                ),
                "orderRevenue",
            ],
            [
                fn(
                    "SUM",
                    literal(
                        `CASE WHEN source_type = 'booking' THEN net_amount ELSE 0 END`,
                    ),
                ),
                "bookingRevenue",
            ],
            [fn("SUM", col("net_amount")), "totalRevenue"],
        ],
        where: {
            status: "recorded",
            transaction_date: {
                [Op.between]: [startDate, now],
            },
        },
        group: [literal(labelAlias)], // Group theo alias label
        order: [[orderExpr, "ASC"]], // Order theo biểu thức đã được sửa
        raw: true,
    });

    return rows.map((item) => ({
        label: item[labelAlias],
        orderRevenue: Number(item.orderRevenue || 0),
        bookingRevenue: Number(item.bookingRevenue || 0),
        totalRevenue: Number(item.totalRevenue || 0),
    }));
};

const getRevenueBySource = async (groupBy = "day") => {
    const { startDate, endDate } = getDateRangeByGroup(groupBy);

    const rows = await db.RevenueTransaction.findAll({
        attributes: ["source_type", [fn("SUM", col("net_amount")), "revenue"]],
        where: {
            status: "recorded",
            transaction_date: {
                [Op.between]: [startDate, endDate],
            },
        },
        group: ["source_type"],
        raw: true,
    });

    return rows.map((item) => ({
        name: item.source_type,
        value: Number(item.revenue || 0),
    }));
};

const getRecentTransactions = async (limit = 10, groupBy = "day") => {
    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
    const { startDate, endDate } = getDateRangeByGroup(groupBy);

    return db.RevenueTransaction.findAll({
        where: {
            status: "recorded",
            transaction_date: {
                [Op.between]: [startDate, endDate],
            },
        },
        include: [
            {
                model: db.Order,
                as: "order",
                attributes: ["order_id", "customer_id", "status"],
                required: false,
            },
            {
                model: db.Booking,
                as: "booking",
                attributes: ["booking_id", "customer_id", "status", "date"],
                required: false,
            },
        ],
        order: [["transaction_date", "DESC"]],
        limit: safeLimit,
    });
};

const getDashboardData = async (groupBy = "day") => {
    const safeGroupBy = normalizeGroupBy(groupBy);

    const [cards, lineChart, pieChart, recentTransactions] = await Promise.all([
        getRevenueSummary(safeGroupBy),
        getRevenueByPeriod(safeGroupBy),
        getRevenueBySource(safeGroupBy),
        getRecentTransactions(10, safeGroupBy),
    ]);

    return {
        cards,
        lineChart,
        pieChart,
        recentTransactions,
    };
};

export default {
    getRevenueSummary,
    getRevenueByPeriod,
    getRevenueBySource,
    getRecentTransactions,
    getDashboardData,
};
