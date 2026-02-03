import BookingService from "../services/BookingService.js";

const createBooking = async (req, res) => {
    const userId = req.user.user_id;
    const result = await BookingService.createBooking(userId, req.body);
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
    const { booking_id, status } = req.body;
    const staffId = req.user.user_id;

    const result = await BookingService.updateBookingStatus(
        booking_id,
        status,
        staffId,
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
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
    customerCancelBooking,
    staffCancelBooking,
    assignBooking,
};
