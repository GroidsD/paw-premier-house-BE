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
        staffId
    );
    return res.status(200).json(result);
};

export default {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
};
