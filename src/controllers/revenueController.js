import RevenueService from "../services/RevenueService.js";

const getRevenueSummary = async (req, res) => {
    try {
        const data = await RevenueService.getRevenueSummary();

        return res.status(200).json({
            success: true,
            message: "Revenue summary fetched successfully",
            data,
        });
    } catch (error) {
        console.error("getRevenueSummary error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch revenue summary",
        });
    }
};

const getRevenueByPeriod = async (req, res) => {
    try {
        const { groupBy = "day" } = req.query;
        const data = await RevenueService.getRevenueByPeriod(groupBy);

        return res.status(200).json({
            success: true,
            message: "Revenue by period fetched successfully",
            data,
        });
    } catch (error) {
        console.error("getRevenueByPeriod error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch revenue by period",
        });
    }
};

const getRevenueBySource = async (req, res) => {
    try {
        const data = await RevenueService.getRevenueBySource();

        return res.status(200).json({
            success: true,
            message: "Revenue by source fetched successfully",
            data,
        });
    } catch (error) {
        console.error("getRevenueBySource error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch revenue by source",
        });
    }
};

const getRecentTransactions = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const data = await RevenueService.getRecentTransactions(limit);

        return res.status(200).json({
            success: true,
            message: "Recent revenue transactions fetched successfully",
            data,
        });
    } catch (error) {
        console.error("getRecentTransactions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch recent revenue transactions",
        });
    }
};

const getRevenueDashboard = async (req, res) => {
    try {
        const { groupBy = "day" } = req.query;
        const data = await RevenueService.getDashboardData(groupBy);

        return res.status(200).json({
            success: true,
            message: "Revenue dashboard fetched successfully",
            data,
        });
    } catch (error) {
        console.error("getRevenueDashboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch revenue dashboard",
        });
    }
};

export default {
    getRevenueSummary,
    getRevenueByPeriod,
    getRevenueBySource,
    getRecentTransactions,
    getRevenueDashboard,
};
