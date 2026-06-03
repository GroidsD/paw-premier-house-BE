import BookingService from "../services/BookingService.js";
import buildUrlEmail from "../utils/buildUrlEmail.js";
import { generateVerifyToken, verifyToken } from "../utils/jwt.js";
const { sendBookingEmail } = require("../services/BookingEmailService.js");
const moMoService = require("../services/MoMoService");
const verifyBooking = async (req, res) => {
    try {
        const { token, bookingId } = req.body;

        const decoded = verifyToken(token);

        // check bookingId trong token
        if (Number(decoded.type) !== Number(bookingId)) {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Invalid booking",
            });
        }

        const bookingResult = await BookingService.getBookingById(bookingId);

        if (bookingResult.errCode !== 0) {
            return res.status(404).json({
                errCode: 1,
                errMessage: bookingResult.errMessage,
            });
        }

        const booking = bookingResult.data;

        // check user
        if (decoded.userId !== booking.customer_id) {
            return res.status(403).json({
                errCode: 1,
                errMessage: "Unauthorized booking",
            });
        }

        if (
            booking.payment_method === "MOMO" &&
            booking.payment_status !== "paid"
        ) {
            return res.status(400).json({
                errCode: 1,
                errMessage:
                    "Please complete MoMo payment before confirming the booking.",
            });
        }

        // nếu đã confirm rồi thì trả luôn
        if (booking.status === "confirmed") {
            return res.status(200).json({
                errCode: 0,
                errMessage: "The booking was previously confirmed",
                alreadyConfirmed: true,
                booking,
            });
        }

        const updateResult = await BookingService.updateBookingStatus({
            bookingId,
            status: "confirmed",
        });

        if (updateResult.errCode !== 0) {
            return res.status(400).json({
                errCode: 1,
                errMessage: updateResult.errMessage,
            });
        }

        return res.status(200).json({
            errCode: 0,
            errMessage: "Booking confirmed successfully",
            alreadyConfirmed: false,
            booking: updateResult.booking,
        });
    } catch (error) {
        return res.status(400).json({
            errCode: -1,
            errMessage: "Token expired or invalid",
        });
    }
};

const createBooking = async (req, res) => {
    const userId = req.user.user_id;
    const result = await BookingService.createBooking(userId, req.body);

    if (result.errCode !== 0) {
        return res.status(400).json(result);
    }

    const { booking, user } = result;

    let token = null;
    let url = null;

    if (booking.payment_method !== "MOMO") {
        token = generateVerifyToken(userId, booking.booking_id);
        url = buildUrlEmail("booking", booking.booking_id, token);
    }

    let paymentUrl = null;

    if (booking.payment_method === "MOMO") {
        try {
            const paymentResult = await moMoService.createPayment({
                orderInfo: `Thanh toán booking ${booking.booking_code}`,
                orderId: booking.booking_id,
                resourceType: "booking",
            });

            paymentUrl = paymentResult?.data?.payUrl || null;
        } catch (paymentError) {
            console.error(
                "Create MoMo payment for booking failed:",
                paymentError,
            );
        }
    }

    if (booking.payment_method !== "MOMO") {
        try {
            await sendBookingEmail({
                user,
                booking,
                token,
                paymentUrl,
            });
        } catch (err) {
            console.error("Send booking email failed:", err);
        }
    }

    // trả về cả url để test, thực tế sẽ không trả về url này
    return res.status(200).json({ ...result, url, paymentUrl });
};

const getMyBookings = async (req, res) => {
    const userId = req.user.user_id;
    const result = await BookingService.getMyBookings(userId);
    return res.status(200).json(result);
};

const getAllBookings = async (req, res) => {
    const result = await BookingService.getAllBookings();
    return res.status(200).json(result);
};

const updateBookingStatus = async (req, res) => {
    const { booking_id, status, staff_id } = req.body;

    const result = await BookingService.updateBookingStatus({
        bookingId: booking_id,
        status,
        staffId: staff_id,
    });

    return res.status(200).json(result);
};

const createBookingPayment = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const bookingResult = await BookingService.getBookingById(bookingId);

        if (bookingResult.errCode !== 0) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Booking not found",
            });
        }

        const booking = bookingResult.data;

        if (booking.payment_method !== "MOMO") {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Booking is not set for MoMo payment",
            });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({
                errCode: 1,
                errMessage: "Booking is not in pending state",
            });
        }

        const result = await moMoService.createPayment({
            orderInfo: `Thanh toán booking ${booking.booking_code}`,
            orderId: booking.booking_id,
            resourceType: "booking",
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("Create booking MoMo payment failed:", error);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Create booking MoMo payment failed",
        });
    }
};

const customerCancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const result = await BookingService.cancelBooking({
        bookingId,
        cancelledBy: "customer",
        cancelReason: reason,
        userId: req.user.user_id,
    });

    return res.status(200).json(result);
};
const staffCancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const result = await BookingService.cancelBooking({
        bookingId,
        cancelledBy: "staff",
        cancelReason: reason,
        userId: req.user.user_id,
    });

    return res.status(200).json(result);
};
const assignBooking = async (req, res) => {
    const { bookingId } = req.params;
    const { schedule_id } = req.body;
    if (!schedule_id)
        return res.status(400).json({ error: "schedule_id is required" });
    const result = await BookingService.assignBookingToStaff({
        bookingId,
        staffId: req.user.user_id,
        scheduleId: schedule_id,
    });

    return res.status(200).json(result);
};
const getBookingById = async (req, res) => {
    const { bookingId } = req.params;

    const result = await BookingService.getBookingById(bookingId);

    if (result.errCode !== 0) {
        return res.status(404).json(result);
    }

    return res.status(200).json(result);
};
export default {
    verifyBooking,
    createBooking,
    createBookingPayment,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    customerCancelBooking,
    staffCancelBooking,
    assignBooking,
    getBookingById,
};
