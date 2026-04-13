import { Booking, BookingItem, Service } from "../../../models";

const findUserBookings = async ({ currentUser, message }) => {
    const bookings = await Booking.findAll({
        where: {
            customer_id: currentUser.user_id,
        },
        include: [
            {
                model: BookingItem,
                as: "bookingItems",
                required: false,
                include: [
                    {
                        model: Service,
                        as: "service",
                        required: false,
                        attributes: ["service_id", "name", "price", "duration"],
                    },
                ],
            },
        ],
        limit: 5,
        order: [["created_at", "DESC"]],
    });

    return {
        type: "bookings",
        items: bookings.map((booking) => ({
            booking_id: booking.booking_id,
            booking_code: booking.booking_code,
            status: booking.status,
            date: booking.date,
            check_in: booking.check_in,
            check_out: booking.check_out,
            note: booking.note,
            total_price: Number(booking.total_price || 0),
            original_price: Number(booking.original_price || 0),
            discount: Number(booking.discount || 0),
            bookingItems: (booking.bookingItems || []).map((item) => ({
                bookingItem_id: item.bookingItem_id,
                price: Number(item.price || 0),
                check_in: item.check_in,
                check_out: item.check_out,
                service: item.service
                    ? {
                          service_id: item.service.service_id,
                          name: item.service.name,
                          price: Number(item.service.price || 0),
                          duration: Number(item.service.duration || 0),
                      }
                    : null,
            })),
        })),
        user_question: message,
    };
};

module.exports = {
    findUserBookings,
};
