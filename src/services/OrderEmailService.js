const { sendEmail } = require("./EmailService");
const buildUrlEmail = require("../utils/buildUrlEmail");

const formatPrice = (value) => {
    const number = Number(value || 0);
    return `${number.toLocaleString("vi-VN")} VND`;
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
                background-color:#f4f6f8;
                font-family:Arial,Helvetica,sans-serif;
                color:#1f2937;
            ">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f8; margin:0; padding:24px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                                
                                <tr>
                                    <td style="
                                        background:linear-gradient(135deg,#22c55e,#16a34a);
                                        padding:32px 24px;
                                        text-align:center;
                                    ">
                                        <div style="
                                            width:64px;
                                            height:64px;
                                            line-height:64px;
                                            margin:0 auto 16px;
                                            background:rgba(255,255,255,0.18);
                                            border-radius:50%;
                                            font-size:32px;
                                            text-align:center;
                                        ">🛍️</div>
                                        <h1 style="
                                            margin:0;
                                            font-size:28px;
                                            line-height:36px;
                                            color:#ffffff;
                                            font-weight:700;
                                        ">
                                            Order Created Successfully
                                        </h1>
                                        <p style="
                                            margin:10px 0 0;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#eafff1;
                                        ">
                                            Thank you for your purchase. Please confirm your order to continue processing.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:32px 24px 8px;">
                                        <p style="
                                            margin:0 0 16px;
                                            font-size:16px;
                                            line-height:26px;
                                            color:#111827;
                                        ">
                                            Hello <strong>${user?.fullname || "Customer"}</strong>,
                                        </p>

                                        <p style="
                                            margin:0 0 24px;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#4b5563;
                                        ">
                                            Your order has been created successfully in our system. Below are your order details:
                                        </p>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                            background:#f9fafb;
                                            border:1px solid #e5e7eb;
                                            border-radius:12px;
                                            margin-bottom:24px;
                                        ">
                                            <tr>
                                                <td style="padding:20px;">
                                                    <h2 style="
                                                        margin:0 0 16px;
                                                        font-size:18px;
                                                        line-height:26px;
                                                        color:#111827;
                                                    ">
                                                        Order Information
                                                    </h2>

                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Order ID</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:600;" align="right">
                                                                #${order?.order_id || ""}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Order Code</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#111827; font-weight:600;" align="right">
                                                                ${order?.order_code || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Total Amount</td>
                                                            <td style="padding:8px 0; font-size:18px; color:#16a34a; font-weight:700;" align="right">
                                                                ${formatPrice(order?.total_price)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#6b7280;">Status</td>
                                                            <td style="padding:8px 0;" align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:6px 12px;
                                                                    background:#fef3c7;
                                                                    color:#92400e;
                                                                    border-radius:999px;
                                                                    font-size:12px;
                                                                    font-weight:700;
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

                                        <div style="text-align:center; margin:28px 0 20px;">
                                            <a href="${url}"
                                                style="
                                                    display:inline-block;
                                                    background:#16a34a;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-size:16px;
                                                    font-weight:700;
                                                    padding:14px 28px;
                                                    border-radius:10px;
                                                    box-shadow:0 6px 14px rgba(22,163,74,0.25);
                                                ">
                                                Confirm Order
                                            </a>
                                        </div>

                                        <p style="
                                            margin:0 0 12px;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#6b7280;
                                        ">
                                            Please confirm your order so we can start processing and shipping it as soon as possible.
                                        </p>

                                        <p style="
                                            margin:0;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#9ca3af;
                                        ">
                                            If the button does not work, copy and paste this link into your browser:
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
                                        padding:24px;
                                        border-top:1px solid #e5e7eb;
                                        text-align:center;
                                        background:#ffffff;
                                    ">
                                        <p style="
                                            margin:0 0 6px;
                                            font-size:14px;
                                            color:#111827;
                                            font-weight:600;
                                        ">
                                            Thank you for shopping with us
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
