const { sendEmail } = require("./EmailService");
const fs = require("fs");
const path = require("path");
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

const loadTemplate = (templateName) => {
    const templatePath = path.join(__dirname, "../templates/emails", `${templateName}.html`);
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
    const template = loadTemplate("payment-success");
    const html = renderTemplate(template, {
        userFullname: user?.fullname || "Customer",
        orderId: order?.order_id || "",
        orderCode: order?.order_code || "---",
        orderStatus: order?.status || "confirmed",
        totalPrice: formatPrice(order?.total_price),
        orderItems: renderOrderItems(order?.orderItems || []),
        originalPrice: formatPrice(order?.original_price),
        shippingFee: formatPrice(order?.shipping_fee),
        discount: formatPrice(order?.discount),
    });

    return sendEmail({
        to: user.email,
        subject: "Payment Successful - Paw Premier House",
        html,
    });
};

const sendOrderTimeoutEmail = async ({ user, order }) => {
    const template = loadTemplate("order-timeout");
    const html = renderTemplate(template, {
        userFullname: user?.fullname || "Customer",
        orderId: order?.order_id || "",
        orderCode: order?.order_code || "---",
        totalPrice: formatPrice(order?.total_price),
    });

    return sendEmail({
        to: user.email,
        subject: "Payment Expired - Paw Premier House",
        html,
    });
};

const sendOrderShippingEmail = async ({ user, order }) => {
    const template = loadTemplate("order-shipping");
    const html = renderTemplate(template, {
        userFullname: user?.fullname || "Customer",
        orderId: order?.order_id || "",
        orderCode: order?.order_code || "---",
        totalPrice: formatPrice(order?.total_price),
        orderItems: renderOrderItems(order?.orderItems || []),
        receiverName: order?.receiver_name || "",
        receiverPhone: order?.receiver_phone || "",
        receiverAddress: `${order?.receiver_address || ""}, ${order?.receiver_district || ""}, ${order?.receiver_province || ""}`,
    });

    return sendEmail({
        to: user.email,
        subject: "Order Shipped - Paw Premier House",
        html,
    });
};

const sendOrderCompletedEmail = async ({ user, order }) => {
    const template = loadTemplate("order-completed");
    const html = renderTemplate(template, {
        userFullname: user?.fullname || "Customer",
        orderId: order?.order_id || "",
        orderCode: order?.order_code || "---",
        totalPrice: formatPrice(order?.total_price),
        orderItems: renderOrderItems(order?.orderItems || []),
        originalPrice: formatPrice(order?.original_price),
        shippingFee: formatPrice(order?.shipping_fee),
        discount: formatPrice(order?.discount),
    });

    return sendEmail({
        to: user.email,
        subject: "Order Completed - Paw Premier House",
        html,
    });
};

module.exports = {
    sendPaymentSuccessEmail,
    sendOrderTimeoutEmail,
    sendOrderShippingEmail,
    sendOrderCompletedEmail,
};
