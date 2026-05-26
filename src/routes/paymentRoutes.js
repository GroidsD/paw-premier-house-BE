const express = require("express");

const {
    createMoMoPayment,
    handleMoMoReturn,
    healthCheck,
} = require("../controllers/paymentController");

const router = express.Router();

// Create payment
router.post("/api/payment/create", createMoMoPayment);

// MoMo return URL (GET)
router.get("/api/payment/momo/return", handleMoMoReturn);

// Health check
router.get("/api/payment/health", healthCheck);

module.exports = router;
