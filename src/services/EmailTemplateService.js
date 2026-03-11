const { sendEmail } = require("./EmailService");
const buildUrlEmail = require("../utils/buildUrlEmail");

const sendBookingEmail = async ({ user, booking, token }) => {
    const url = buildUrlEmail("booking", booking.booking_id, token);

    return sendEmail({
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
            </ul>

            <a href="${url}"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#4CAF50;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                ">
                View Booking
            </a>
        `,
    });
};

export default {
    sendBookingEmail,
};
