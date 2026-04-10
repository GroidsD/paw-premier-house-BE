const { sendEmail } = require("./EmailService");
const buildUrlEmail = require("../utils/buildUrlEmail");

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

const sendOrderEmail = async ({ user, order, token }) => {
    const url = buildUrlEmail("order", order.order_id, token);

    return sendEmail({
        to: user.email,
        subject: "Order Confirmation",
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
                                            Order placed successfully!
                                        </h1>

                                        <p style="
                                            margin:12px 0 0;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#d1d5db;
                                        ">
                                            Thank you for shopping at Paw Premier House. Please confirm your order so we can begin processing it.
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
                                            Your order has been created successfully in our system. Below are the details of your order:
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
                                                        Order information
                                                    </h2>

                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Order ID</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:700;" align="right">
                                                                #${order?.order_id || ""}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Order code</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#2563eb; font-weight:700;" align="right">
                                                                ${order?.order_code || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Total payment</td>
                                                            <td style="padding:8px 0; font-size:18px; color:#0f766e; font-weight:800;" align="right">
                                                                ${formatPrice(order?.total_price)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Status</td>
                                                            <td style="padding:8px 0;" align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:7px 12px;
                                                                    background:#e5e7eb;
                                                                    color:#374151;
                                                                    border-radius:999px;
                                                                    font-size:12px;
                                                                    font-weight:800;
                                                                    text-transform:uppercase;
                                                                    letter-spacing:0.3px;
                                                                ">
                                                                    ${order?.status || ""}
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
                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#6b7280;">Image</th>
                                                <th align="left" style="padding:12px 8px; font-size:13px; color:#6b7280;">Product</th>
                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#6b7280;">Qty</th>
                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#6b7280;">Price</th>
                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#6b7280;">Total</th>
                                            </tr>
                                            ${renderOrderItems(order?.orderItems || [])}
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
                                                                ${formatPrice(order?.original_price)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:6px 0; font-size:14px; color:#6b7280;">Shipping fee</td>
                                                            <td align="right" style="padding:6px 0; font-size:14px; color:#111827;">
                                                                ${formatPrice(order?.shipping_fee)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:6px 0; font-size:14px; color:#6b7280;">Discount</td>
                                                            <td align="right" style="padding:6px 0; font-size:14px; color:#dc2626; font-weight:700;">
                                                                - ${formatPrice(order?.discount)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 0 0; font-size:16px; color:#111827; font-weight:800;">Grand total</td>
                                                            <td align="right" style="padding:10px 0 0; font-size:20px; color:#0f766e; font-weight:800;">
                                                                ${formatPrice(order?.total_price)}
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
                                                Confirm order
                                            </a>
                                        </div>

                                        <p style="
                                            margin:0 0 10px;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#4b5563;
                                        ">
                                            Please confirm your order so we can process and deliver it as soon as possible.
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
    sendOrderEmail,
};
