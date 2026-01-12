const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

exports.send_otp_email = async (email, otp) => {
    try {
        const templatePath = path.join(__dirname, "otp_email.html");
        let html = fs.readFileSync(templatePath, "utf8");

        html = html.replace("{{OTP}}", otp);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"E-Commerce App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Email Verification OTP",
            html,
        });

        return true;
    } catch (error) {
        console.error("SMTP error:", error);
        return false;
    }
};
