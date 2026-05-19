const { sendEmail } = require("./EmailService");
// const buildUrlEmail = require("../utils/buildUrlEmail");

const formatPrice = (value) => {
    const number = Number(value || 0);
    return `${number.toLocaleString("vi-VN")} VND`;
};

const buildImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
        return image;
    }

    const baseUrl = (
        process.env.BACKEND_URL || "http://localhost:5050"
    ).replace(/\/$/, "");
    return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
};

const renderOrderItems = (orderItems = []) => {
    if (!orderItems.length) {
        return `
            <tr>
                <td colspan="5" style="padding:14px; font-size:14px; color:#6b7280; text-align:center;">
                    No items found
                </td>
            </tr>
        `;
    }

    return orderItems
        .map((item) => {
            const productName = item.product_name || "Product";
            const variantLabel = item.variant_label
                ? ` - ${item.variant_label}`
                : "";
            const quantity = Number(item.quantity || 0);
            const unitPrice = formatPrice(item.price || 0);
            const totalPrice = formatPrice(item.total_price || 0);
            const imageUrl = buildImageUrl(item.product_image);

            return `
                <tr>
                    <td style="padding:12px 8px; border-bottom:1px solid #e5e7eb;" align="center">
                        ${
                            imageUrl
                                ? `<img 
                                        src="${imageUrl}" 
                                        alt="${productName}" 
                                        width="56" 
                                        height="56"
                                        style="
                                            display:block;
                                            width:56px;
                                            height:56px;
                                            object-fit:cover;
                                            border-radius:12px;
                                            border:1px solid #e5e7eb;
                                            background:#ffffff;
                                        "
                                   />`
                                : `<div style="
                                        width:56px;
                                        height:56px;
                                        line-height:56px;
                                        text-align:center;
                                        border-radius:12px;
                                        border:1px solid #e5e7eb;
                                        background:#f9fafb;
                                        font-size:12px;
                                        color:#9ca3af;
                                   ">No image</div>`
                        }
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#111827; font-weight:600;">
                        ${productName}${variantLabel}
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

const sendPaymentSuccessEmail = async ({ user, order }) => {
    return sendEmail({
        to: user.email,
        subject: "Payment Successful - Paw Premier House",
        html: `
            <div style="
                margin:0;
                padding:0;
                background-color:#f3f4f6;
                font-family:Arial, Helvetica, sans-serif;
                color:#111827;
            ">
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        background-color:#f3f4f6;
                        margin:0;
                        padding:28px 0;
                    "
                >
                    <tr>
                        <td align="center">

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    max-width:680px;
                                    background:#ffffff;
                                    border-radius:24px;
                                    overflow:hidden;
                                    border:1px solid #e5e7eb;
                                "
                            >

                                <!-- HEADER -->
                                <tr>
                                    <td style="
                                        background:#111827;
                                        padding:36px 24px 32px;
                                        text-align:center;
                                    ">

                                        <div style="
                                            width:72px;
                                            height:72px;
                                            line-height:72px;
                                            margin:0 auto 18px;
                                            background:#1f2937;
                                            border-radius:50%;
                                            font-size:34px;
                                            text-align:center;
                                        ">
                                            ✅
                                        </div>

                                        <h1 style="
                                            margin:0;
                                            font-size:30px;
                                            line-height:38px;
                                            color:#ffffff;
                                            font-weight:800;
                                        ">
                                            Payment Successful!
                                        </h1>

                                        <p style="
                                            margin:14px 0 0;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#d1d5db;
                                        ">
                                            Thank you for your purchase at Paw Premier House.
                                            Your payment has been received successfully and
                                            your order is now being prepared.
                                        </p>

                                    </td>
                                </tr>

                                <!-- BODY -->
                                <tr>
                                    <td style="padding:32px 24px 12px;">

                                        <p style="
                                            margin:0 0 14px;
                                            font-size:16px;
                                            line-height:26px;
                                            color:#111827;
                                        ">
                                            Hello
                                            <strong>
                                                ${user?.fullname || "Customer"}
                                            </strong>,
                                        </p>

                                        <p style="
                                            margin:0 0 24px;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#4b5563;
                                        ">
                                            We have successfully received your payment.
                                            Below are the details of your order.
                                        </p>

                                        <!-- ORDER INFO -->
                                        <table
                                            role="presentation"
                                            width="100%"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                background:#f9fafb;
                                                border:1px solid #e5e7eb;
                                                border-radius:18px;
                                                margin-bottom:24px;
                                            "
                                        >
                                            <tr>
                                                <td style="padding:20px;">

                                                    <h2 style="
                                                        margin:0 0 16px;
                                                        font-size:18px;
                                                        line-height:26px;
                                                        color:#111827;
                                                        font-weight:800;
                                                    ">
                                                        Order Information
                                                    </h2>

                                                    <table
                                                        role="presentation"
                                                        width="100%"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                    >

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Order ID
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:8px 0;
                                                                    font-size:14px;
                                                                    color:#111827;
                                                                    font-weight:700;
                                                                "
                                                            >
                                                                #${order?.order_id || ""}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Order Code
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:8px 0;
                                                                    font-size:14px;
                                                                    color:#2563eb;
                                                                    font-weight:700;
                                                                "
                                                            >
                                                                ${order?.order_code || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Payment Status
                                                            </td>

                                                            <td align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:7px 12px;
                                                                    background:#dcfce7;
                                                                    color:#166534;
                                                                    border-radius:999px;
                                                                    font-size:12px;
                                                                    font-weight:800;
                                                                    text-transform:uppercase;
                                                                ">
                                                                    Paid
                                                                </span>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Order Status
                                                            </td>

                                                            <td align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:7px 12px;
                                                                    background:#dbeafe;
                                                                    color:#1d4ed8;
                                                                    border-radius:999px;
                                                                    font-size:12px;
                                                                    font-weight:800;
                                                                    text-transform:uppercase;
                                                                ">
                                                                    ${order?.status || "confirmed"}
                                                                </span>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:10px 0 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Total Payment
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:10px 0 0;
                                                                    font-size:22px;
                                                                    color:#0f766e;
                                                                    font-weight:800;
                                                                "
                                                            >
                                                                ${formatPrice(order?.total_price)}
                                                            </td>
                                                        </tr>

                                                    </table>

                                                </td>
                                            </tr>
                                        </table>

                                        <!-- PRODUCT TABLE -->
                                        <table
                                            role="presentation"
                                            width="100%"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                border:1px solid #e5e7eb;
                                                border-radius:18px;
                                                overflow:hidden;
                                                margin-bottom:24px;
                                                background:#ffffff;
                                            "
                                        >

                                            <tr style="background:#f9fafb;">
                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#6b7280;">
                                                    Image
                                                </th>

                                                <th align="left" style="padding:12px 8px; font-size:13px; color:#6b7280;">
                                                    Product
                                                </th>

                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#6b7280;">
                                                    Qty
                                                </th>

                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#6b7280;">
                                                    Price
                                                </th>

                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#6b7280;">
                                                    Total
                                                </th>
                                            </tr>

                                            ${renderOrderItems(order?.orderItems || [])}

                                        </table>

                                        <!-- SUMMARY -->
                                        <table
                                            role="presentation"
                                            width="100%"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                margin-bottom:28px;
                                                background:#f9fafb;
                                                border:1px solid #e5e7eb;
                                                border-radius:18px;
                                            "
                                        >
                                            <tr>
                                                <td style="padding:18px;">

                                                    <table
                                                        role="presentation"
                                                        width="100%"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                    >

                                                        <tr>
                                                            <td style="
                                                                padding:6px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Subtotal
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:6px 0;
                                                                    font-size:14px;
                                                                    color:#111827;
                                                                "
                                                            >
                                                                ${formatPrice(order?.original_price)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:6px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Shipping Fee
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:6px 0;
                                                                    font-size:14px;
                                                                    color:#111827;
                                                                "
                                                            >
                                                                ${formatPrice(order?.shipping_fee)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:6px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Discount
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:6px 0;
                                                                    font-size:14px;
                                                                    color:#dc2626;
                                                                    font-weight:700;
                                                                "
                                                            >
                                                                - ${formatPrice(order?.discount)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:12px 0 0;
                                                                font-size:18px;
                                                                color:#111827;
                                                                font-weight:800;
                                                            ">
                                                                Grand Total
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:12px 0 0;
                                                                    font-size:24px;
                                                                    color:#0f766e;
                                                                    font-weight:800;
                                                                "
                                                            >
                                                                ${formatPrice(order?.total_price)}
                                                            </td>
                                                        </tr>

                                                    </table>

                                                </td>
                                            </tr>
                                        </table>

                                        <p style="
                                            margin:0;
                                            text-align:center;
                                            font-size:14px;
                                            line-height:22px;
                                            color:#4b5563;
                                        ">
                                            We are preparing your order and will notify you
                                            once it has been shipped.
                                        </p>

                                    </td>
                                </tr>

                                <!-- FOOTER -->
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
                                            This is an automated email. Please do not reply
                                            directly to this message.
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

const sendOrderTimeoutEmail = async ({ user, order }) => {
    return sendEmail({
        to: user.email,
        subject: "Payment Expired - Paw Premier House",
        html: `
            <div style="
                margin:0;
                padding:0;
                background-color:#f3f4f6;
                font-family:Arial, Helvetica, sans-serif;
                color:#111827;
            ">
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                    style="
                        background-color:#f3f4f6;
                        margin:0;
                        padding:28px 0;
                    "
                >
                    <tr>
                        <td align="center">

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    max-width:680px;
                                    background:#ffffff;
                                    border-radius:24px;
                                    overflow:hidden;
                                    border:1px solid #e5e7eb;
                                "
                            >

                                <!-- HEADER -->
                                <tr>
                                    <td style="
                                        background:#f59e0b;
                                        padding:36px 24px 32px;
                                        text-align:center;
                                    ">

                                        <div style="
                                            width:72px;
                                            height:72px;
                                            line-height:72px;
                                            margin:0 auto 18px;
                                            background:#d97706;
                                            border-radius:50%;
                                            font-size:34px;
                                            text-align:center;
                                        ">
                                            ⏰
                                        </div>

                                        <h1 style="
                                            margin:0;
                                            font-size:30px;
                                            line-height:38px;
                                            color:#ffffff;
                                            font-weight:800;
                                        ">
                                            Payment Expired
                                        </h1>

                                        <p style="
                                            margin:14px 0 0;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#fef3c7;
                                        ">
                                            Your payment session has expired.
                                            The reserved stock has been released.
                                        </p>

                                    </td>
                                </tr>

                                <!-- BODY -->
                                <tr>
                                    <td style="padding:32px 24px 12px;">

                                        <p style="
                                            margin:0 0 14px;
                                            font-size:16px;
                                            line-height:26px;
                                            color:#111827;
                                        ">
                                            Hello
                                            <strong>
                                                ${user?.fullname || "Customer"}
                                            </strong>,
                                        </p>

                                        <p style="
                                            margin:0 0 24px;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#4b5563;
                                        ">
                                            Your payment session has expired because the payment was not
                                            completed within the time limit. Your order is still pending and
                                            you can try to pay again.
                                        </p>

                                        <!-- ORDER INFO -->
                                        <table
                                            role="presentation"
                                            width="100%"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="
                                                background:#fffbeb;
                                                border:1px solid #fcd34d;
                                                border-radius:18px;
                                                margin-bottom:24px;
                                            "
                                        >
                                            <tr>
                                                <td style="padding:20px;">

                                                    <h2 style="
                                                        margin:0 0 16px;
                                                        font-size:18px;
                                                        line-height:26px;
                                                        color:#b45309;
                                                        font-weight:800;
                                                    ">
                                                        Order Information
                                                    </h2>

                                                    <table
                                                        role="presentation"
                                                        width="100%"
                                                        cellspacing="0"
                                                        cellpadding="0"
                                                        border="0"
                                                    >

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Order ID
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:8px 0;
                                                                    font-size:14px;
                                                                    color:#111827;
                                                                    font-weight:700;
                                                                "
                                                            >
                                                                #${order?.order_id || ""}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Order Code
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:8px 0;
                                                                    font-size:14px;
                                                                    color:#2563eb;
                                                                    font-weight:700;
                                                                "
                                                            >
                                                                ${order?.order_code || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Payment Status
                                                            </td>

                                                            <td align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:7px 12px;
                                                                    background:#fef3c7;
                                                                    color:#b45309;
                                                                    border-radius:999px;
                                                                    font-size:12px;
                                                                    font-weight:800;
                                                                    text-transform:uppercase;
                                                                ">
                                                                    Expired
                                                                </span>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:8px 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Order Status
                                                            </td>

                                                            <td align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:7px 12px;
                                                                    background:#fef3c7;
                                                                    color:#b45309;
                                                                    border-radius:999px;
                                                                    font-size:12px;
                                                                    font-weight:800;
                                                                    text-transform:uppercase;
                                                                ">
                                                                    Expired
                                                                </span>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="
                                                                padding:10px 0 0;
                                                                font-size:14px;
                                                                color:#6b7280;
                                                            ">
                                                                Total Payment
                                                            </td>

                                                            <td
                                                                align="right"
                                                                style="
                                                                    padding:10px 0 0;
                                                                    font-size:22px;
                                                                    color:#b45309;
                                                                    font-weight:800;
                                                                "
                                                            >
                                                                ${formatPrice(order?.total_price)}
                                                            </td>
                                                        </tr>

                                                    </table>

                                                </td>
                                            </tr>
                                        </table>

                                        <p style="
                                            margin:0 0 16px;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#4b5563;
                                        ">
                                            Please try to complete your payment again within 15 minutes
                                            to avoid expiration.
                                        </p>

                                        <p style="
                                            margin:0;
                                            text-align:center;
                                            font-size:14px;
                                            line-height:22px;
                                            color:#4b5563;
                                        ">
                                            Thank you for your understanding.
                                        </p>

                                    </td>
                                </tr>

                                <!-- FOOTER -->
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
                                            This is an automated email. Please do not reply
                                            directly to this message.
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
    sendPaymentSuccessEmail,
    sendOrderTimeoutEmail,
};
