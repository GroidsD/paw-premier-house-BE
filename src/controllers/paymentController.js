const moMoService = require("../services/MoMoService");

// Create payment
let createMoMoPayment = async (req, res) => {
    try {
        const {
            orderInfo,
            orderId,
            resourceType,
            extraData,
            returnUrl,
            notifyUrl,
        } = req.body;

        if (!orderId) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing required field: orderId",
            });
        }

        const result = await moMoService.createPayment({
            orderInfo: orderInfo || `Thanh toán đơn hàng ${orderId}`,
            orderId,
            resourceType: resourceType || "order",
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
    const FRONTEND_URL = process.env.FRONTEND_URL;

    try {
        const result = await moMoService.handleCallback(req.query);

        if (result.errCode !== 0) {
            console.log("❌ Payment error");
            return res.redirect(`${FRONTEND_URL}/?payment=error`);
        }

        const { orderId, resourceType, paymentStatus } = result;

        if (resourceType === "booking") {
            console.log("Redirect booking");

            return res.redirect(
                `${FRONTEND_URL}/confirm-booking?status=${paymentStatus}&bookingId=${orderId}`,
            );
        }

        return res.redirect(
            `${FRONTEND_URL}/confirm-order?status=${paymentStatus}&orderId=${orderId}`,
        );
    } catch (error) {
        console.error("❌ handleMoMoReturn error:");
        console.error(error);

        return res.status(500).json({
            message: error.message,
            stack: error.stack,
        });
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
