const fs = require("fs");
const path = require("path");
const {transporter} = require("../../config/email");

exports.send_otp_email = async (email, otp) => {
    try {
        const templatePath = path.join(__dirname, "otp_email.html");
        let html = fs.readFileSync(templatePath, "utf8");

        html = html.replace("{{OTP}}", otp);

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
