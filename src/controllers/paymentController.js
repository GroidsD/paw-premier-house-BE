const moMoService = require("../services/MoMoService");

// Create payment
let createMoMoPayment = async (req, res) => {
    try {
        const { orderInfo, orderId, extraData, returnUrl, notifyUrl } = req.body;

        if (!orderId) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing required field: orderId",
            });
        }

        const result = await moMoService.createPayment({
            orderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`,
            orderId,
            extraData,
            returnUrl,
            notifyUrl,
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Create MoMo payment error:", error);

        return res.status(500).json({
            errCode: 1,
            message: error.message || "Server error",
        });
    }
};

// Handle redirect from MoMo (GET)
let handleMoMoReturn = async (req, res) => {
    try {
        const result = await moMoService.handleCallback(req.query);

        if (result.errCode !== 0) {
            return res.redirect(`http://localhost:5173/?payment=error`);
        }

        const orderId = result.orderId;

        // SUCCESS
        if (result.paymentStatus === "paid") {
            return res.redirect(
                `http://localhost:5173/confirm-payment?payment=success&orderId=${orderId}`,
            );
        }

        // FAILED
        return res.redirect(
            `http://localhost:5173/confirm-payment?payment=failed&orderId=${orderId}`,
        );
    } catch (error) {
        console.error("❌ handleMoMoReturn error:", error);
        return res.redirect(`http://localhost:5173/?payment=error`);
    }
};

// Handle IPN from MoMo (POST)
let handleMoMoIPN = async (req, res) => {
    try {
        const result = await moMoService.handleCallback(req.body);

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ handleMoMoIPN error:", error);
        return res.status(500).json({
            errCode: 1,
            message: "IPN processing failed",
        });
    }
};

// Health check
let healthCheck = (req, res) => {
    return res.status(200).json({
        errCode: 0,
        message: "Payment service is healthy",
        timestamp: new Date().toISOString(),
    });
};

module.exports = {
    createMoMoPayment,
    handleMoMoReturn,
    handleMoMoIPN,
    healthCheck,
};
