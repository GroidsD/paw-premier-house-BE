import db from "../models/index.js";

const randomString = (length = 6) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};

const generateBookingCode = async () => {
    let bookingCode;
    let exists = true;
    let retry = 0;

    while (exists && retry < 10) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        bookingCode = `BK${yyyy}${mm}${dd}${randomString(6)}`;

        const found = await db.Booking.findOne({
            where: { booking_code: bookingCode },
            attributes: ["booking_id"],
        });

        exists = !!found;
        retry++;
    }

    if (exists) {
        throw new Error("Không thể tạo booking code duy nhất");
    }

    return bookingCode;
};

export default generateBookingCode;