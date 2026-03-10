const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.office365.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const sendEmail = async ({ to, cc, bcc, subject, text, html }) => {
    try {
        await transporter.sendMail({
            from: `"Pet Sanctuary" <${process.env.EMAIL_USER}>`,
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
