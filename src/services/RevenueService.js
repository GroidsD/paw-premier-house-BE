import db from "../models/index.js";
import { Op, fn, col } from "sequelize";

const getStartOfToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
};

const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};

const getStartOfYear = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
};

const getRevenueSummary = async () => {
    const today = getStartOfToday();
    const month = getStartOfMonth();
    const year = getStartOfYear();

    const [totalRevenue, todayRevenue, monthRevenue, yearRevenue] =
        await Promise.all([
            db.RevenueTransaction.sum("net_amount", {
                where: { status: "recorded" },
            }),
            db.RevenueTransaction.sum("net_amount", {
                where: {
                    status: "recorded",
                    transaction_date: { [Op.gte]: today },
                },
            }),
            db.RevenueTransaction.sum("net_amount", {
                where: {
                    status: "recorded",
                    transaction_date: { [Op.gte]: month },
                },
            }),
            db.RevenueTransaction.sum("net_amount", {
                where: {
                    status: "recorded",
                    transaction_date: { [Op.gte]: year },
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
        todayRevenue: Number(todayRevenue || 0),
        monthRevenue: Number(monthRevenue || 0),
        yearRevenue: Number(yearRevenue || 0),
        totalOrdersCompleted,
        totalBookingsCompleted,
        cancelledOrders,
        cancelledBookings,
    };
};

const getRevenueByPeriod = async (groupBy = "day") => {
    const safeGroupBy = ["day", "month", "year"].includes(groupBy)
        ? groupBy
        : "day";

    let formatExpr;
    const labelAlias = "label";

    if (safeGroupBy === "month") {
        formatExpr = fn("DATE_FORMAT", col("transaction_date"), "%Y-%m");
    } else if (safeGroupBy === "year") {
        formatExpr = fn("DATE_FORMAT", col("transaction_date"), "%Y");
    } else {
        formatExpr = fn("DATE_FORMAT", col("transaction_date"), "%Y-%m-%d");
    }

    const rows = await db.RevenueTransaction.findAll({
        attributes: [
            [formatExpr, labelAlias],
            [fn("SUM", col("net_amount")), "revenue"],
        ],
        where: {
            status: "recorded",
        },
        group: [formatExpr],
        order: [[formatExpr, "ASC"]],
        raw: true,
    });

    return rows.map((item) => ({
        label: item[labelAlias],
        revenue: Number(item.revenue || 0),
    }));
};

const getRevenueBySource = async () => {
    const rows = await db.RevenueTransaction.findAll({
        attributes: ["source_type", [fn("SUM", col("net_amount")), "revenue"]],
        where: {
            status: "recorded",
        },
        group: ["source_type"],
        raw: true,
    });

    return rows.map((item) => ({
        name: item.source_type,
        value: Number(item.revenue || 0),
    }));
};

const getRecentTransactions = async (limit = 10) => {
    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

    const rows = await db.RevenueTransaction.findAll({
        where: {
            status: "recorded",
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

    return rows;
};

const getDashboardData = async (groupBy = "day") => {
    const [cards, lineChart, pieChart, recentTransactions] = await Promise.all([
        getRevenueSummary(),
        getRevenueByPeriod(groupBy),
        getRevenueBySource(),
        getRecentTransactions(10),
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
