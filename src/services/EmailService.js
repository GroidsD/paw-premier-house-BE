const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.office365.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // 465 = true, 587 = false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠ chỉ dev/test, prod nên bỏ
  },
});

/**
 * Send email
 * @param {Object} param0
 * @param {string|string[]} param0.to - Người nhận chính
 * @param {string|string[]} [param0.cc] - Người nhận CC giửi nhiều ng công khai
 * @param {string|string[]} [param0.bcc] - Người nhận BCC giửi nhiều ng nhưng ẩn danh những ng cc khác
 * @param {string} param0.subject - Tiêu đề
 * @param {string} [param0.text] - Nội dung plain text
 * @param {string} [param0.html] - Nội dung HTML
 */
const sendEmail = async ({ to, cc, bcc, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"Audit System" <${process.env.EMAIL_USER}>`,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
    });
    console.log("✅ Email sent:", { to, cc });
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};

module.exports = { sendEmail };
