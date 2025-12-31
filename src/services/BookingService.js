import db from "../models/index.js";

const createBooking = async (userId, data) => {
    const t = await db.sequelize.transaction();
    try {
        // 1️⃣ Tạo booking
        const booking = await db.Booking.create(
            {
                customer_id: userId,
                pet_id: data.pet_id,
                date: data.date,
                status: "pending",
            },
            { transaction: t }
        );

        let totalPrice = 0;

        // 2️⃣ Tạo booking items từ service
        for (const item of data.services) {
            const service = await db.Service.findOne({
                where: {
                    service_id: item.service_id,
                    isActive: true,
                    isDeleted: false,
                },
            });

            if (!service) {
                throw new Error("Service not found");
            }

            totalPrice += Number(service.price);

            await db.BookingItem.create(
                {
                    booking_id: booking.booking_id,
                    service_id: service.service_id,
                    price: service.price, // snapshot giá
                },
                { transaction: t }
            );
        }

        // 3️⃣ Update tổng tiền
        await booking.update({ total_price: totalPrice }, { transaction: t });

        await t.commit();

        return {
            errCode: 0,
            errMessage: "Booking created successfully",
            booking,
        };
    } catch (error) {
        await t.rollback();
        return {
            errCode: 1,
            errMessage: error.message,
        };
    }
};
const getMyBookings = async (userId) => {
    const bookings = await db.Booking.findAll({
        where: { customer_id: userId },
        include: [
            {
                model: db.BookingItem,
                as: "bookingItems",
                include: [
                    {
                        model: db.Service,
                        as: "service",
                        include: [
                            {
                                model: db.ServiceCategory,
                                as: "category",
                            },
                        ],
                    },
                ],
            },
        ],
        order: [["created_at", "DESC"]],
    });

    return { errCode: 0, bookings };
};
const getAllBookings = async () => {
    const bookings = await db.Booking.findAll({
        include: [
            { model: db.User, as: "customer" },
            { model: db.User, as: "staff" },
            { model: db.Pet, as: "pet" },
            {
                model: db.BookingItem,
                as: "bookingItems",
                include: [
                    {
                        model: db.Service,
                        as: "service",
                        include: [
                            {
                                model: db.ServiceCategory,
                                as: "category",
                            },
                        ],
                    },
                ],
            },
        ],
        order: [["created_at", "DESC"]],
    });

    return { errCode: 0, bookings };
};
const updateBookingStatus = async (id, status, staffId) => {
    const booking = await db.Booking.findByPk(id);
    if (!booking) {
        return { errCode: 1, errMessage: "Booking not found" };
    }

    await booking.update({
        status,
        staff_id: staffId,
    });

    return {
        errCode: 0,
        errMessage: "Booking updated successfully",
    };
};

export default {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus,
};
