const { sendEmail } = require("./EmailService");
const fs = require("fs");
const path = require("path");
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
    const normalized = String(status || "")
        .trim()
        .toLowerCase();

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
    return String(firstType || "service")
        .trim()
        .toLowerCase();
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

const loadTemplate = (templateName) => {
    const templatePath = path.join(
        __dirname,
        "../templates/emails",
        `${templateName}.html`,
    );
    return fs.readFileSync(templatePath, "utf8");
};

const renderTemplate = (template, data) => {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        rendered = rendered.replace(regex, value);
    }
    return rendered;
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
    const normalized = String(type || "service")
        .trim()
        .toLowerCase();

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
                item?.service?.name_vi ||
                item?.service?.name_en ||
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
                item?.service?.description_vi ||
                item?.service?.description_en ||
                item?.description ||
                "";

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

const sendBookingEmail = async ({ user, booking, token, paymentUrl }) => {
    const url = buildUrlEmail("booking", booking.booking_id, token);
    const meta = getBookingMeta(booking);
    const paymentMethodLabel = String(
        booking?.payment_method || "SHOP",
    ).toUpperCase();
    const paymentStatusLabel = String(
        booking?.payment_status || "unpaid",
    ).toUpperCase();

    const actionSection = paymentUrl
        ? `
            <div style="text-align:center; margin:28px 0 18px;">
                <a
                    href="${paymentUrl}"
                    style="
                        display:inline-block;
                        background:#10b981;
                        color:#ffffff;
                        text-decoration:none;
                        font-size:16px;
                        font-weight:800;
                        padding:14px 30px;
                        border-radius:14px;
                    "
                >
                    Thanh toán qua MoMo
                </a>
            </div>
            <p style="
                margin:0 0 20px;
                text-align:center;
                font-size:14px;
                color:#4b5563;
                line-height:22px;
            ">
                Vui lòng hoàn tất thanh toán bằng MoMo để xác nhận booking.
            </p>
            <p style="
                margin:0;
                text-align:center;
                font-size:13px;
                line-height:20px;
                color:#9ca3af;
            ">
                Nếu nút không hoạt động, hãy sao chép đường dẫn bên dưới và dán vào trình duyệt:
            </p>
            <p style="
                margin:8px 0 0;
                text-align:center;
                font-size:13px;
                line-height:20px;
                word-break:break-all;
            ">
                <a href="${paymentUrl}" style="color:#2563eb; text-decoration:none;">${paymentUrl}</a>
            </p>
        `
        : booking?.payment_method === "MOMO" &&
            booking?.payment_status === "paid"
          ? `
                <p style="
                    margin:0 0 20px;
                    text-align:center;
                    font-size:15px;
                    color:#111827;
                    line-height:24px;
                ">
                    Thanh toán MoMo đã hoàn tất và booking của bạn đã được xác nhận thành công.
                </p>
            `
          : `
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
            `;

    const voucherSection = booking?.voucher
        ? `
            <tr>
                <td style="padding:6px 0; font-size:14px; color:#6b7280;">Voucher</td>
                <td align="right" style="padding:6px 0; font-size:14px; color:#111827; font-weight:700;">
                    ${booking?.voucher?.code || booking?.voucher?.name || "---"}
                </td>
            </tr>
        `
        : "";

    const bookingType = getBookingType(booking);
    let templateName = "booking-confirmation";
    if (bookingType === "spa") templateName = "booking-spa";
    else if (bookingType === "hotel") templateName = "booking-hotel";

    const html = renderTemplate(loadTemplate(templateName), {
        userFullname: user?.fullname || "Customer",
        title: meta.title,
        intro: meta.intro,
        badgeLabel: meta.badgeLabel,
        bookingId: booking?.booking_id || "---",
        bookingCode: booking?.booking_code || "---",
        paymentMethod: paymentMethodLabel,
        paymentStatus: paymentStatusLabel,
        petName: booking?.pet?.name || "---",
        petSpecies: booking?.pet?.species || "---",
        petBreed: booking?.pet?.breed || "---",
        bookingDate: formatDateOnly(booking?.date || booking?.created_at),
        totalPrice: formatPrice(booking?.total_price),
        bookingStatus: getBookingStatusLabel(booking?.status),
        bookingStatusStyle: getBookingStatusStyle(booking?.status),
        scheduleRows: renderBookingScheduleRows(booking),
        bookingItems: renderBookingItems(booking),
        originalPrice: formatPrice(
            booking?.original_price ||
                booking?.subtotal ||
                booking?.total_price,
        ),
        discount: formatPrice(booking?.discount || 0),
        voucherSection,
        grandTotal: formatPrice(booking?.total_price),
        actionSection,
    });

    return sendEmail({
        to: user.email,
        subject: meta.subject,
        html,
    });
};

const sendBookingTimeoutEmail = async ({ user, booking }) => {
    const bookingType = getBookingType(booking);
    const checkInValue =
        booking?.check_in_date ||
        booking?.check_in ||
        booking?.start_date ||
        "";
    const checkOutValue =
        booking?.check_out_date ||
        booking?.check_out ||
        booking?.end_date ||
        "";

    const html = renderTemplate(loadTemplate("booking-timeout"), {
        userFullname: user?.fullname || "Customer",
        bookingId: booking?.booking_id || "---",
        bookingCode: booking?.booking_code || "---",
        bookingType: String(bookingType || "service").replace(/^./, (c) =>
            c.toUpperCase(),
        ),
        petName: booking?.pet?.name || booking?.pet_name || "---",
        bookingDate: formatDateOnly(
            booking?.created_at || booking?.date || booking?.booking_date,
        ),
        checkInDate: checkInValue ? formatDateTime(checkInValue) : "---",
        checkOutDate: checkOutValue ? formatDateTime(checkOutValue) : "---",
        paymentStatus: String(
            booking?.payment_status || "expired",
        ).toUpperCase(),
        totalPrice: formatPrice(booking?.total_price),
    });

    return sendEmail({
        to: user.email,
        subject: "Booking payment expired",
        html,
    });
};

const sendBookingReminderEmail = async ({ user, booking }) => {
    const bookingType = getBookingType(booking);
    const checkInValue =
        booking?.check_in || booking?.check_in_date || booking?.date || "";
    const checkOutValue = booking?.check_out || booking?.check_out_date || "";

    const html = renderTemplate(loadTemplate("booking-reminder"), {
        userFullname: user?.fullname || "Customer",
        bookingCode: booking?.booking_code || "---",
        bookingType: String(bookingType || "service").replace(/^./, (c) =>
            c.toUpperCase(),
        ),
        petName: booking?.pet?.name || booking?.pet_name || "---",
        checkInDate: checkInValue ? formatDateTime(checkInValue) : "---",
        checkOutDate: checkOutValue ? formatDateTime(checkOutValue) : "---",
        totalPrice: formatPrice(booking?.total_price),
    });

    return sendEmail({
        to: user.email,
        subject: "Reminder: your booking starts in 15 minutes",
        html,
    });
};

const sendBookingCompletedEmail = async ({ user, booking }) => {
    const bookingType = getBookingType(booking);
    const checkInValue =
        booking?.check_in || booking?.check_in_date || booking?.date || "";
    const checkOutValue = booking?.check_out || booking?.check_out_date || "";

    const html = renderTemplate(loadTemplate("booking-completed"), {
        userFullname: user?.fullname || "Customer",
        bookingId: booking?.booking_id || "---",
        bookingCode: booking?.booking_code || "---",
        bookingType: String(bookingType || "service").replace(/^./, (c) =>
            c.toUpperCase(),
        ),
        petName: booking?.pet?.name || booking?.pet_name || "---",
        petSpecies: booking?.pet?.species || "---",
        petBreed: booking?.pet?.breed || "---",
        checkInDate: checkInValue ? formatDateTime(checkInValue) : "---",
        checkOutDate: checkOutValue ? formatDateTime(checkOutValue) : "---",
        totalPrice: formatPrice(booking?.total_price),
        bookingItems: renderBookingItems(booking),
        originalPrice: formatPrice(
            booking?.original_price ||
                booking?.subtotal ||
                booking?.total_price,
        ),
        discount: formatPrice(booking?.discount || 0),
        grandTotal: formatPrice(booking?.total_price),
    });

    return sendEmail({
        to: user.email,
        subject: "Booking Completed - Paw Premier House",
        html,
    });
};

module.exports = {
    sendBookingEmail,
    sendBookingTimeoutEmail,
    sendBookingReminderEmail,
    sendBookingCompletedEmail,
};
