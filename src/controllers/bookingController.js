import BookingService from "../services/BookingService.js";
import { sendEmail } from "../services/EmailService.js";
import buildUrlEmail from "../utils/buildUrlEmail.js";
import { generateVerifyToken, verifyToken } from "../utils/jwt.js";

const verifyBooking = async (req, res) => {
    try {
        const { token, bookingId } = req.body;

        const decoded = verifyToken(token);

        if (Number(decoded.bookingId) !== Number(bookingId)) {
            return res.status(400).json({
                errCode: 1,
                message: "Invalid token",
            });
        }

        const bookingResult = await BookingService.getBookingById(bookingId);

        if (bookingResult.errCode !== 0) {
            return res.status(404).json({
                errCode: 1,
                message: bookingResult.errMessage,
            });
        }

        return res.status(200).json({
            errCode: 0,
            message: "Booking confirmed",
            data: bookingResult.data,
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
    const token = generateVerifyToken(booking.booking_id);
    const url = buildUrlEmail(booking.booking_id, token);
    try {
        await sendEmail({
            to: user.email,
            subject: "Booking Confirmation",
            html: `
                <h2>Booking Successful 🎉</h2>
                <p>Hello <b>${user.fullname}</b>,</p>
                <p>Your booking has been created successfully.</p>

                <ul>
                    <li><b>Booking ID:</b> ${booking.booking_id}</li>
                    <li><b>Date:</b> ${booking.date}</li>
                    <li><b>Total:</b> ${booking.total_price} VND</li>
                    <li><b>Status:</b> ${booking.status}</li>
                    <a href="${url}" 
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#4CAF50;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                    ">
                        View Booking</a>
                </ul>

                <p>Thank you for using our service.</p>
            `,
        });
    } catch (emailError) {
        console.error("Email send failed:", emailError);
    }
    return res.status(200).json(result);
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
