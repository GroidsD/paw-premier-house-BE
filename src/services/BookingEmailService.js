const { sendEmail } = require("./EmailService");
const buildUrlEmail = require("../utils/buildUrlEmail");

const formatPrice = (value) => {
    const number = Number(value || 0);
    return `${number.toLocaleString("vi-VN")} VND`;
};

const formatDateOnly = (value) => {
    if (!value) return "---";

    try {
        return new Date(value).toLocaleDateString("vi-VN");
    } catch (error) {
        return value;
    }
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

const getBookingItems = (booking) => {
    return (
        booking?.bookingDetails ||
        booking?.bookingItems ||
        booking?.services ||
        booking?.items ||
        []
    );
};

const getBookingType = (booking) => {
    const items = getBookingItems(booking);

    if (!Array.isArray(items) || !items.length) return "service";

    const firstType = items?.[0]?.service?.category?.type;
    return String(firstType || "service").toLowerCase();
};

const getBookingMeta = (booking) => {
    const type = getBookingType(booking);

    if (type === "hotel") {
        return {
            subject: "Hotel Booking Confirmation",
            title: "Your hotel booking has been placed!",
            intro: "Thank you for choosing Paw Premier House. Please review your pet hotel booking details below.",
            badgeLabel: "HOTEL BOOKING",
        };
    }

    if (type === "spa") {
        return {
            subject: "Spa Booking Confirmation",
            title: "Your spa booking has been placed!",
            intro: "Thank you for choosing Paw Premier House. Please review your spa appointment details below.",
            badgeLabel: "SPA BOOKING",
        };
    }

    return {
        subject: "Booking Confirmation",
        title: "Your booking has been placed!",
        intro: "Thank you for choosing Paw Premier House. Please review your booking details below.",
        badgeLabel: "BOOKING",
    };
};

const getServiceImage = (item) => {
    return (
        item?.service?.image ||
        item?.service?.image_url ||
        item?.service?.thumbnail ||
        item?.service?.thumbnail_url ||
        item?.service?.media?.[0]?.url ||
        item?.service?.media?.[0]?.media_url ||
        item?.service?.media?.[0]?.file_url ||
        item?.image ||
        item?.image_url ||
        "https://via.placeholder.com/160x120?text=Service"
    );
};

const renderBookingScheduleRows = (booking) => {
    const bookingType = getBookingType(booking);

    if (bookingType === "hotel") {
        return `
            <tr>
                <td style="padding:8px 0; font-size:14px; color:#6b7280;">Check-in date</td>
                <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                    ${formatDateOnly(booking?.check_in_date || booking?.check_in)}
                </td>
            </tr>
            <tr>
                <td style="padding:8px 0; font-size:14px; color:#6b7280;">Check-out date</td>
                <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                    ${formatDateOnly(booking?.check_out_date || booking?.check_out)}
                </td>
            </tr>
        `;
    }

    return `
        <tr>
            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Appointment start</td>
            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                ${formatDateTime(booking?.check_in)}
            </td>
        </tr>
        <tr>
            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Appointment end</td>
            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                ${formatDateTime(booking?.check_out)}
            </td>
        </tr>
    `;
};

const renderServiceTypeBadge = (type) => {
    const normalized = String(type || "service").toLowerCase();

    if (normalized === "hotel") {
        return `
            <span style="
                display:inline-block;
                padding:5px 10px;
                border-radius:999px;
                font-size:12px;
                font-weight:700;
                background:#ede9fe;
                color:#6d28d9;
                text-transform:uppercase;
            ">
                Hotel
            </span>
        `;
    }

    if (normalized === "spa") {
        return `
            <span style="
                display:inline-block;
                padding:5px 10px;
                border-radius:999px;
                font-size:12px;
                font-weight:700;
                background:#fce7f3;
                color:#be185d;
                text-transform:uppercase;
            ">
                Spa
            </span>
        `;
    }

    return `
        <span style="
            display:inline-block;
            padding:5px 10px;
            border-radius:999px;
            font-size:12px;
            font-weight:700;
            background:#e5e7eb;
            color:#374151;
            text-transform:uppercase;
        ">
            Service
        </span>
    `;
};

const renderBookingItems = (booking) => {
    const items = getBookingItems(booking);

    if (!Array.isArray(items) || !items.length) {
        return `
            <tr>
                <td style="
                    padding:18px;
                    font-size:14px;
                    color:#6b7280;
                    text-align:center;
                    border:1px solid #e5e7eb;
                    border-radius:16px;
                    background:#ffffff;
                ">
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

            const serviceType =
                item?.service?.category?.type ||
                getBookingType(booking) ||
                "service";

            const quantity = Number(item?.quantity || 1);
            const unitPrice = formatPrice(item?.price || item?.unit_price || 0);
            const totalPrice = formatPrice(
                item?.total_price ||
                    Number(item?.price || item?.unit_price || 0) * quantity,
            );

            const description =
                item?.service?.description || item?.description || "";

            const duration = item?.service?.duration;
            const imageUrl = getServiceImage(item);

            const timeInfo =
                String(serviceType).toLowerCase() === "hotel"
                    ? `
                        <tr>
                            <td style="padding:4px 0; font-size:13px; color:#6b7280;">Stay</td>
                            <td style="padding:4px 0; font-size:13px; color:#111827;" align="right">
                                ${formatDateOnly(booking?.check_in_date || booking?.check_in)} - ${formatDateOnly(
                                    booking?.check_out_date ||
                                        booking?.check_out,
                                )}
                            </td>
                        </tr>
                    `
                    : `
                        <tr>
                            <td style="padding:4px 0; font-size:13px; color:#6b7280;">Time</td>
                            <td style="padding:4px 0; font-size:13px; color:#111827;" align="right">
                                ${formatDateTime(item?.check_in || booking?.check_in)}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:4px 0; font-size:13px; color:#6b7280;">Duration</td>
                            <td style="padding:4px 0; font-size:13px; color:#111827;" align="right">
                                ${duration ? `${duration} phút` : "---"}
                            </td>
                        </tr>
                    `;

            return `
                <tr>
                    <td style="padding:0 0 16px 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                            border:1px solid #e5e7eb;
                            border-radius:18px;
                            overflow:hidden;
                            background:#ffffff;
                        ">
                            <tr>
                                <td style="padding:16px;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td valign="top" width="140" style="padding-right:14px;">
                                                <img
                                                    src="${imageUrl}"
                                                    alt="${serviceName}"
                                                    width="140"
                                                    style="
                                                        display:block;
                                                        width:140px;
                                                        max-width:140px;
                                                        height:105px;
                                                        object-fit:cover;
                                                        border-radius:12px;
                                                        border:1px solid #e5e7eb;
                                                    "
                                                />
                                            </td>
                                            <td valign="top">
                                                <div style="
                                                    font-size:17px;
                                                    line-height:24px;
                                                    color:#111827;
                                                    font-weight:800;
                                                    margin:0 0 6px;
                                                ">
                                                    ${serviceName}
                                                </div>

                                                <div style="margin:0 0 10px;">
                                                    ${renderServiceTypeBadge(serviceType)}
                                                </div>



                                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                    <tr>
                                                        <td style="padding:4px 0; font-size:13px; color:#6b7280;">Pet</td>
                                                        <td style="padding:4px 0; font-size:13px; color:#111827;" align="right">
                                                            ${petName}
                                                        </td>
                                                    </tr>

                                                    ${timeInfo}

                                                  

                                                    <tr>
                                                        <td style="padding:4px 0; font-size:13px; color:#6b7280;">Unit price</td>
                                                        <td style="padding:4px 0; font-size:13px; color:#111827;" align="right">
                                                            ${unitPrice}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td style="padding:8px 0 0; font-size:14px; color:#111827; font-weight:700;">Total</td>
                                                        <td style="padding:8px 0 0; font-size:15px; color:#0f766e; font-weight:800;" align="right">
                                                            ${totalPrice}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;
        })
        .join("");
};

const sendBookingEmail = async ({ user, booking, token }) => {
    const url = buildUrlEmail("booking", booking.booking_id, token);
    const meta = getBookingMeta(booking);

    return sendEmail({
        to: user.email,
        subject: meta.subject,
        html: `
            <div style="
                margin:0;
                padding:0;
                background-color:#f3f4f6;
                font-family:Arial, Helvetica, sans-serif;
                color:#111827;
            ">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                    width:100%;
                    background-color:#f3f4f6;
                    margin:0;
                    padding:24px 0;
                ">
                    <tr>
                        <td align="center" style="padding:0 12px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                max-width:680px;
                                background:#ffffff;
                                border-radius:24px;
                                overflow:hidden;
                                border:1px solid #e5e7eb;
                            ">
                                <tr>
                                    <td style="
                                        background:#1f2937;
                                        padding:32px 24px;
                                        text-align:center;
                                    ">
                                        <div style="
                                            display:inline-block;
                                            padding:6px 12px;
                                            border-radius:999px;
                                            background:#374151;
                                            color:#e5e7eb;
                                            font-size:12px;
                                            font-weight:700;
                                            letter-spacing:0.4px;
                                            margin-bottom:14px;
                                        ">
                                            ${meta.badgeLabel}
                                        </div>

                                        <div style="
                                            font-size:32px;
                                            line-height:32px;
                                            margin-bottom:14px;
                                        ">
                                            🐾
                                        </div>

                                        <h1 style="
                                            margin:0;
                                            font-size:28px;
                                            line-height:36px;
                                            color:#ffffff;
                                            font-weight:800;
                                        ">
                                            ${meta.title}
                                        </h1>

                                        <p style="
                                            margin:12px 0 0;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#d1d5db;
                                        ">
                                            ${meta.intro}
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:28px 24px 10px;">
                                        <p style="
                                            margin:0 0 12px;
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
                                            Your booking has been successfully created in our system. Please review the details below.
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
                                                                #${booking?.booking_id || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Booking code</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#2563eb; font-weight:700;" align="right">
                                                                ${booking?.booking_code || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Pet name</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                ${booking?.pet?.name || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Species</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                ${booking?.pet?.species || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Breed</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                ${booking?.pet?.breed || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Booking date</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                ${formatDateOnly(
                                                                    booking?.date ||
                                                                        booking?.created_at,
                                                                )}
                                                            </td>
                                                        </tr>

                                                        ${renderBookingScheduleRows(booking)}

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Total payment</td>
                                                            <td style="padding:8px 0; font-size:18px; color:#0f766e; font-weight:800;" align="right">
                                                                ${formatPrice(booking?.total_price)}
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
                                                                    ${getBookingStatusStyle(booking?.status)}
                                                                ">
                                                                    ${getBookingStatusLabel(booking?.status)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="
                                            margin:0 0 12px;
                                            font-size:18px;
                                            line-height:26px;
                                            color:#111827;
                                            font-weight:800;
                                        ">
                                            Service details
                                        </div>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;">
                                            ${renderBookingItems(booking)}
                                        </table>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                            margin-bottom:24px;
                                            background:#f9fafb;
                                            border:1px solid #e5e7eb;
                                            border-radius:18px;
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
                                                                - ${formatPrice(booking?.discount || 0)}
                                                            </td>
                                                        </tr>

                                                        ${
                                                            booking?.voucher
                                                                ? `
                                                            <tr>
                                                                <td style="padding:6px 0; font-size:14px; color:#6b7280;">Voucher</td>
                                                                <td align="right" style="padding:6px 0; font-size:14px; color:#111827; font-weight:700;">
                                                                    ${booking?.voucher?.code || booking?.voucher?.name || "---"}
                                                                </td>
                                                            </tr>
                                                        `
                                                                : ""
                                                        }

                                                        <tr>
                                                            <td style="padding:10px 0 0; font-size:16px; color:#111827; font-weight:800;">Grand total</td>
                                                            <td align="right" style="padding:10px 0 0; font-size:20px; color:#0f766e; font-weight:800;">
                                                                ${formatPrice(booking?.total_price)}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="text-align:center; margin:28px 0 18px;">
                                            <a
                                                href="${url}"
                                                style="
                                                    display:inline-block;
                                                    background:#2563eb;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-size:16px;
                                                    font-weight:800;
                                                    padding:14px 30px;
                                                    border-radius:14px;
                                                "
                                            >
                                                Confirm booking
                                            </a>
                                        </div>

                                        <p style="
                                            margin:0 0 10px;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#4b5563;
                                        ">
                                           Please confirm your booking so we can process it as soon as possible.
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
