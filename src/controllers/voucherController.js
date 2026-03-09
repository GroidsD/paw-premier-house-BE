import VoucherService from "../services/VoucherService.js";

const validateVoucher = async (req, res) => {
    try {
        const { code, totalPrice, applyFor } = req.body;

        const result = await VoucherService.validateVoucher({
            code,
            totalPrice,
            applyFor: applyFor || "order",
        });

        return res.json({
            errCode: 0,
            message: "Voucher hợp lệ",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            errCode: 1,
            errMessage: error.message,
        });
    }
};

const redeemVoucher = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { code, totalPrice, orderId, bookingId } = req.body;

        const result = await VoucherService.redeemVoucher({
            code,
            userId,
            totalPrice,
            orderId,
            bookingId,
        });

        return res.json({
            errCode: 0,
            message: "Redeem voucher thành công",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            errCode: 1,
            errMessage: error.message,
        });
    }
};

const createVoucher = async (req, res) => {
    try {
        const voucher = await VoucherService.createVoucher(req.body);

        return res.json({
            errCode: 0,
            message: "Tạo voucher thành công",
            voucher,
        });
    } catch (error) {
        return res.status(400).json({
            errCode: 1,
            errMessage: error.message,
        });
    }
};

const listVouchers = async (req, res) => {
    try {
        const { page, pageSize, search, type, status } = req.query;

        const data = await VoucherService.listVouchers({
            page,
            pageSize,
            search,
            type,
            status,
        });

        return res.status(200).json({ errCode: 0, data });
    } catch (e) {
        return res.status(500).json({ errCode: 1, errMessage: e.message });
    }
};

const getVoucherStats = async (req, res) => {
    try {
        const stats = await VoucherService.getVoucherStats();
        return res.status(200).json({ errCode: 0, data: stats });
    } catch (e) {
        return res.status(500).json({ errCode: 1, errMessage: e.message });
    }
};

const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const voucher = await VoucherService.updateVoucher(id, req.body);

        return res.json({
            errCode: 0,
            message: "Cập nhật voucher thành công",
            voucher,
        });
    } catch (error) {
        return res.status(400).json({
            errCode: 1,
            errMessage: error.message,
        });
    }
};

export default {
    validateVoucher,
    redeemVoucher,
    createVoucher,
    listVouchers,
    getVoucherStats,
    updateVoucher,
};
