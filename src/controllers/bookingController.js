import BookingService from "../services/BookingService.js";
import { sendEmail } from "../services/EmailService.js";
import buildUrlEmail from "../utils/buildUrlEmail.js";
import { generateVerifyToken, verifyToken } from "../utils/jwt.js";
import sendBookingEmail from "../services/EmailTemplateService.js";

const verifyBooking = async (req, res) => {
    try {
        const { token, bookingId } = req.body;

        const decoded = verifyToken(token);

        // kiểm tra bookingId trong token
        if (Number(decoded.bookingId) !== Number(bookingId)) {
            return res.status(400).json({
                errCode: 1,
                message: "Invalid booking",
            });
        }

        const bookingResult = await BookingService.getBookingById(bookingId);

        if (bookingResult.errCode !== 0) {
            return res.status(404).json({
                errCode: 1,
                message: bookingResult.errMessage,
            });
        }

        const booking = bookingResult.data;

        // kiểm tra userId trong token
        if (decoded.userId !== booking.customer_id) {
            return res.status(403).json({
                errCode: 1,
                message: "Unauthorized booking",
            });
        }

        return res.status(200).json({
            errCode: 0,
            message: "Booking confirmed",
            booking,
        });
    } catch (error) {
        return res.status(400).json({
            errCode: -1,
            message: "Token expired or invalid",
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

    // token chứa userId + bookingId
    const token = generateVerifyToken(userId, booking.booking_id);

    const url = buildUrlEmail("booking", booking.booking_id, token);

    try {
        await sendBookingEmail({
            user,
            booking,
            token,
        });
    } catch (err) {
        console.error("Send booking email failed:", err);
    }
    // trả về cả url để test, thực tế sẽ không trả về url này
    return res.status(200).json({ ...result, url });
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

    const result = await BookingService.updateBookingStatus(
        booking_id,
        status,
        staff_id,
    );
    return res.status(200).json(result);
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

export default {
    verifyBooking,
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    customerCancelBooking,
    staffCancelBooking,
    assignBooking,
};
