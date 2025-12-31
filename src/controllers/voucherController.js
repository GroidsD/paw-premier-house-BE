import VoucherService from "../services/VoucherService.js";

const applyVoucher = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { code, totalPrice, orderId, bookingId } = req.body;

        const result = await VoucherService.applyVoucher({
            code,
            userId,
            totalPrice,
            orderId,
            bookingId,
        });

        return res.json({
            errCode: 0,
            message: "Áp voucher thành công",
            ...result,
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

export default {
    applyVoucher,
    createVoucher,
};
