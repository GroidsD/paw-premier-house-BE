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
                <td colspan="5" style="padding:14px; font-size:14px; color:#8b6f68; text-align:center;">
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
                    <td style="padding:12px 8px; border-bottom:1px solid #f3d9d2;" align="center">
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
                                            border:1px solid #f3d9d2;
                                            background:#ffffff;
                                        "
                                   />`
                                : `<div style="
                                        width:56px;
                                        height:56px;
                                        line-height:56px;
                                        text-align:center;
                                        border-radius:12px;
                                        border:1px solid #f3d9d2;
                                        background:#fff7f5;
                                        font-size:12px;
                                        color:#b79b93;
                                   ">No image</div>`
                        }
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #f3d9d2; font-size:14px; color:#4b342f; font-weight:600;">
                        ${productName}${variantLabel}
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #f3d9d2; font-size:14px; color:#4b342f;" align="center">
                        ${quantity}
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #f3d9d2; font-size:14px; color:#4b342f;" align="right">
                        ${unitPrice}
                    </td>

                    <td style="padding:12px 8px; border-bottom:1px solid #f3d9d2; font-size:14px; color:#f77762; font-weight:700;" align="right">
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
        subject: "Xác nhận đơn hàng",
        html: `
            <div style="
                margin:0;
                padding:0;
                background-color:#fff7f5;
                font-family:Arial,Helvetica,sans-serif;
                color:#4b342f;
            ">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fff7f5; margin:0; padding:28px 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px; background:#ffffff; border-radius:28px; overflow:hidden; box-shadow:0 10px 30px rgba(180,120,100,0.10);">
                                
                                <tr>
                                    <td style="
                                        background:linear-gradient(135deg,#ffb29f,#ff8f7a);
                                        padding:34px 24px 30px;
                                        text-align:center;
                                    ">
                                        <div style="
                                            width:68px;
                                            height:68px;
                                            line-height:68px;
                                            margin:0 auto 16px;
                                            background:rgba(255,255,255,0.35);
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
                                            Đặt hàng thành công!
                                        </h1>

                                        <p style="
                                            margin:12px 0 0;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#fff7f5;
                                        ">
                                            Cảm ơn bạn đã mua sắm tại Paw Premier House. Vui lòng xác nhận đơn hàng để chúng tôi bắt đầu xử lý.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:30px 24px 10px;">
                                        <p style="
                                            margin:0 0 14px;
                                            font-size:16px;
                                            line-height:26px;
                                            color:#4b342f;
                                        ">
                                            Xin chào <strong>${user?.fullname || "Customer"}</strong>,
                                        </p>

                                        <p style="
                                            margin:0 0 22px;
                                            font-size:15px;
                                            line-height:24px;
                                            color:#8b6f68;
                                        ">
                                            Đơn hàng của bạn đã được tạo thành công trong hệ thống. Dưới đây là thông tin chi tiết đơn hàng:
                                        </p>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                            background:#fff3ef;
                                            border:1px solid #f3d9d2;
                                            border-radius:20px;
                                            margin-bottom:22px;
                                        ">
                                            <tr>
                                                <td style="padding:20px;">
                                                    <h2 style="
                                                        margin:0 0 14px;
                                                        font-size:18px;
                                                        line-height:26px;
                                                        color:#4b342f;
                                                        font-weight:800;
                                                    ">
                                                        Thông tin đơn hàng
                                                    </h2>

                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#8b6f68;">Mã đơn</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#4b342f; font-weight:700;" align="right">
                                                                #${order?.order_id || ""}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#8b6f68;">Mã đơn hàng</td>
                                                            <td style="padding:8px 0; font-size:14px; color:#f77762; font-weight:700;" align="right">
                                                                ${order?.order_code || "---"}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#8b6f68;">Tổng thanh toán</td>
                                                            <td style="padding:8px 0; font-size:18px; color:#f77762; font-weight:800;" align="right">
                                                                ${formatPrice(order?.total_price)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="padding:8px 0; font-size:14px; color:#8b6f68;">Trạng thái</td>
                                                            <td style="padding:8px 0;" align="right">
                                                                <span style="
                                                                    display:inline-block;
                                                                    padding:7px 12px;
                                                                    background:#ffe7df;
                                                                    color:#f77762;
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
                                            border:1px solid #f3d9d2;
                                            border-radius:20px;
                                            overflow:hidden;
                                            margin-bottom:22px;
                                            background:#ffffff;
                                        ">
                                            <tr style="background:#fff3ef;">
                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#8b6f68;">Ảnh</th>
                                                <th align="left" style="padding:12px 8px; font-size:13px; color:#8b6f68;">Sản phẩm</th>
                                                <th align="center" style="padding:12px 8px; font-size:13px; color:#8b6f68;">SL</th>
                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#8b6f68;">Giá</th>
                                                <th align="right" style="padding:12px 8px; font-size:13px; color:#8b6f68;">Tổng</th>
                                            </tr>
                                            ${renderOrderItems(order?.orderItems || [])}
                                        </table>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="
                                            margin-bottom:24px;
                                            background:#fffaf8;
                                            border:1px solid #f3e4df;
                                            border-radius:18px;
                                            padding:0;
                                        ">
                                            <tr>
                                                <td style="padding:16px 18px;">
                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                                        <tr>
                                                            <td style="padding:6px 0; font-size:14px; color:#8b6f68;">Tạm tính</td>
                                                            <td align="right" style="padding:6px 0; font-size:14px; color:#4b342f;">
                                                                ${formatPrice(order?.original_price)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:6px 0; font-size:14px; color:#8b6f68;">Phí vận chuyển</td>
                                                            <td align="right" style="padding:6px 0; font-size:14px; color:#4b342f;">
                                                                ${formatPrice(order?.shipping_fee)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:6px 0; font-size:14px; color:#8b6f68;">Giảm giá</td>
                                                            <td align="right" style="padding:6px 0; font-size:14px; color:#e26a5c; font-weight:700;">
                                                                - ${formatPrice(order?.discount)}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:10px 0 0; font-size:16px; color:#4b342f; font-weight:800;">Tổng cộng</td>
                                                            <td align="right" style="padding:10px 0 0; font-size:20px; color:#f77762; font-weight:800;">
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
                                                    background:#ff8f7a;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-size:16px;
                                                    font-weight:800;
                                                    padding:14px 30px;
                                                    border-radius:14px;
                                                    box-shadow:0 8px 18px rgba(247,119,98,0.25);
                                                ">
                                                Xác nhận đơn hàng
                                            </a>
                                        </div>

                                        <p style="
                                            margin:0 0 10px;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#8b6f68;
                                        ">
                                            Vui lòng xác nhận đơn hàng để chúng tôi có thể xử lý và giao hàng sớm nhất cho bạn.
                                        </p>

                                        <p style="
                                            margin:0;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            color:#b79b93;
                                        ">
                                            Nếu nút không hoạt động, hãy sao chép và dán liên kết sau vào trình duyệt:
                                        </p>

                                        <p style="
                                            margin:8px 0 0;
                                            text-align:center;
                                            font-size:13px;
                                            line-height:20px;
                                            word-break:break-all;
                                        ">
                                            <a href="${url}" style="color:#f77762; text-decoration:none;">
                                                ${url}
                                            </a>
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding:22px 24px 26px;
                                        border-top:1px solid #f3e4df;
                                        text-align:center;
                                        background:#fffaf8;
                                    ">
                                        <p style="
                                            margin:0 0 6px;
                                            font-size:14px;
                                            color:#4b342f;
                                            font-weight:700;
                                        ">
                                            Paw Premier House
                                        </p>
                                        <p style="
                                            margin:0;
                                            font-size:12px;
                                            line-height:18px;
                                            color:#b79b93;
                                        ">
                                            Đây là email tự động, vui lòng không trả lời trực tiếp email này.
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
