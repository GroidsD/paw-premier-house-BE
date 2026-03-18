const { sendEmail } = require("./EmailService");
const buildUrlEmail = require("../utils/buildUrlEmail");

const formatPrice = (value) => {
    const number = Number(value || 0);
    return `${number.toLocaleString("vi-VN")} VND`;
};

const formatDateTime = (value) => {
    if (!value) return "---";

    try {
        return new Date(value).toLocaleString("vi-VN");
    } catch (error) {
        return value;
    }
};

const getBookingStatusLabel = (status) => {
    if (!status) return "Pending";

    const normalized = String(status).toLowerCase();

    switch (normalized) {
        case "pending":
            return "Pending";
        case "confirmed":
            return "Confirmed";
        case "processing":
            return "Processing";
        case "completed":
            return "Completed";
        case "cancelled":
            return "Cancelled";
        default:
            return status;
    }
};

const getBookingStatusStyle = (status) => {
    const normalized = String(status || "").toLowerCase();

    switch (normalized) {
        case "confirmed":
            return `
                background:#dcfce7;
                color:#166534;
            `;
        case "completed":
            return `
                background:#dbeafe;
                color:#1d4ed8;
            `;
        case "cancelled":
            return `
                background:#fee2e2;
                color:#b91c1c;
            `;
        case "processing":
            return `
                background:#fef3c7;
                color:#92400e;
            `;
        default:
            return `
                background:#e5e7eb;
                color:#374151;
            `;
    }
};

const renderBookingItems = (booking) => {
    const items =
        booking?.bookingDetails ||
        booking?.bookingItems ||
        booking?.services ||
        booking?.items ||
        [];

    if (!Array.isArray(items) || !items.length) {
        return `
            <tr>
                <td colspan="5" style="padding:14px; font-size:14px; color:#6b7280; text-align:center;">
                    No booking items found
                </td>
            </tr>
        `;
    }

    return items
        .map((item) => {
            const serviceName =
                item?.service_name ||
                item?.name ||
                item?.service?.name ||
                "Service";

            const petName =
                item?.pet_name ||
                item?.pet?.name ||
                booking?.pet_name ||
                booking?.pet?.name ||
                "---";

            const quantity = Number(item?.quantity || 1);
            const unitPrice = formatPrice(item?.price || item?.unit_price || 0);
            const totalPrice = formatPrice(
                item?.total_price ||
                    Number(item?.price || item?.unit_price || 0) * quantity,
            );

            return `
                <tr>
                    <td style="padding:12px 8px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#111827; font-weight:600;">
                        ${serviceName}
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#374151;" align="center">
                        ${petName}
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#374151;" align="center">
                        ${quantity}
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#374151;" align="right">
                        ${unitPrice}
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#0f766e; font-weight:700;" align="right">
                        ${totalPrice}
                    </td>
                </tr>
            `;
        })
        .join("");
};

const sendBookingEmail = async ({ user, booking, token }) => {
    const url = buildUrlEmail("booking", booking.booking_id, token);

    return sendEmail({
        to: user.email,
        subject: "Booking Confirmation",
        html: `
            <div style="
                margin:0;
                padding:0;
                background-color:#f3f4f6;
                font-family:Arial, Helvetica, sans-serif;
                color:#111827;
            ">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6; margin:0; padding:28px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e5e7eb;">
                                
                                <tr>
                                    <td style="
                                        background:#1f2937;
                                        padding:34px 24px 30px;
                                        text-align:center;
                                    ">
                                        <div style="
                                            width:68px;
                                            height:68px;
                                            line-height:68px;
                                            margin:0 auto 16px;
                                            background:#374151;
                                            border-radius:50%;
                                            font-size:30px;
                                            text-align:center;
                                        ">🐾</div>

                                        <h1 style="
                                            margin:0;
                                            font-size:28px;
                                            line-height:36px;
                                            color:#ffffff;
                                            font-weight:800;
                                        ">
                                            Booking placed successfully!
                                        </h1>

                                        <p style="
                                            margin:12px 0 0;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#d1d5db;
                                        ">
                                            Thank you for booking with Paw Premier House. Please review your booking information below.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:30px 24px 10px;">
                                        <p style="
                                            margin:0 0 14px;
                                            font-size:16px;
                                            line-height:26px;
                                            color:#111827;
                                        ">
                                            Hello <strong>${user?.fullname || "Customer"}</strong>,
                                        </p>

                                        <p style="
                                            margin:0 0 22px;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#4b5563;
                                        ">
                                            Your booking has been created successfully in our system. Below are the details of your booking:
                                        </p>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                            background:#f9fafb;
                                            border:1px solid #e5e7eb;
                                            border-radius:18px;
                                            margin-bottom:22px;
                                        ">
                                            <tr>
                                                <td style="padding:20px;">
                                                    <h2 style="
                                                        margin:0 0 14px;
                                                        font-size:18px;
                                                        line-height:26px;
                                                        color:#111827;
                                                        font-weight:800;
                                                    ">
                                                        Booking information
                                                    </h2>

                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Booking ID</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                #${booking?.booking_id || ""}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Booking code</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#2563eb; font-weight:700;" align="right">
                                                                ${booking?.booking_code || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Booking date</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                ${formatDateTime(
                                                                    booking?.date ||
                                                                        booking?.booking_date ||
                                                                        booking?.created_at,
                                                                )}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Check-in</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                ${formatDateTime(
                                                                    booking?.check_in_date ||
                                                                        booking?.start_date ||
                                                                        booking?.checkIn,
                                                                )}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Check-out</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                ${formatDateTime(
                                                                    booking?.check_out_date ||
                                                                        booking?.end_date ||
                                                                        booking?.checkOut,
                                                                )}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Total payment</td>
                                                            <td style="padding:8px 0; font-size:18px; color:#0f766e; font-weight:800;" align="right">
                                                                ${formatPrice(
                                                                    booking?.total_price,
                                                                )}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Status</td>
                                                            <td style="padding:8px 0;" align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:7px 12px;
                                                                    border-radius:999px;
                                                                    font-size:12px;
                                                                    font-weight:800;
                                                                    text-transform:uppercase;
                                                                    letter-spacing:0.3px;
                                                                    ${getBookingStatusStyle(
                                                                        booking?.status,
                                                                    )}
                                                                ">
                                                                    ${getBookingStatusLabel(
                                                                        booking?.status,
                                                                    )}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                            border:1px solid #e5e7eb;
                                            border-radius:18px;
                                            overflow:hidden;
                                            margin-bottom:22px;
                                            background:#ffffff;
                                        ">
                                            <tr style="background:#f9fafb;">
                                                <th align="left" style="padding:12px 8px; font-size:13px; color:#6b7280;">Service</th>
                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#6b7280;">Pet</th>
                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#6b7280;">Qty</th>
                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#6b7280;">Price</th>
                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#6b7280;">Total</th>
                                            </tr>
                                            ${renderBookingItems(booking)}
                                        </table>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                            margin-bottom:24px;
                                            background:#f9fafb;
                                            border:1px solid #e5e7eb;
                                            border-radius:18px;
                                            padding:0;
                                        ">
                                            <tr>
                                                <td style="padding:16px 18px;">
                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="padding:6px 0; font-size:14px; color:#6b7280;">Subtotal</td>
                                                            <td align="right" style="padding:6px 0; font-size:14px; color:#111827;">
                                                                ${formatPrice(
                                                                    booking?.original_price ||
                                                                        booking?.subtotal ||
                                                                        booking?.total_price,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:6px 0; font-size:14px; color:#6b7280;">Discount</td>
                                                            <td align="right" style="padding:6px 0; font-size:14px; color:#dc2626; font-weight:700;">
                                                                - ${formatPrice(
                                                                    booking?.discount || 0,
                                                                )}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 0 0; font-size:16px; color:#111827; font-weight:800;">Grand total</td>
                                                            <td align="right" style="padding:10px 0 0; font-size:20px; color:#0f766e; font-weight:800;">
                                                                ${formatPrice(
                                                                    booking?.total_price,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="text-align:center; margin:28px 0 18px;">
                                            <a href="${url}"
                                                style="
                                                    display:inline-block;
                                                    background:#2563eb;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-size:16px;
                                                    font-weight:800;
                                                    padding:14px 30px;
                                                    border-radius:14px;
                                                ">
                                                View your booking
                                            </a>
                                        </div>

                                        <p style="
                                            margin:0 0 10px;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#4b5563;
                                        ">
                                            You can review your booking details and follow the status by clicking the button above.
                                        </p>

                                        <p style="
                                            margin:0;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#9ca3af;
                                        ">
                                            If the button does not work, please copy and paste the following link into your browser:
                                        </p>

                                        <p style="
                                            margin:8px 0 0;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            word-break:break-all;
                                        ">
                                            <a href="${url}" style="color:#2563eb; text-decoration:none;">
                                                ${url}
                                            </a>
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:22px 24px 26px;
                                        border-top:1px solid #e5e7eb;
                                        text-align:center;
                                        background:#f9fafb;
                                    ">
                                        <p style="
                                            margin:0 0 6px;
                                            font-size:14px;
                                            color:#111827;
                                            font-weight:700;
                                        ">
                                            Paw Premier House
                                        </p>
                                        <p style="
                                            margin:0;
                                            font-size:12px;
                                            line-height:18px;
                                            color:#9ca3af;
                                        ">
                                            This is an automated email. Please do not reply directly to this message.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        `,
    });
};

module.exports = {
    sendBookingEmail,
};