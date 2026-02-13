const fs = require("fs");
const path = require("path");
const { transporter } = require("../../config/email");

exports.sendEmail = async (email, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"E-Commerce App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: subject,
            html,
        });

        return true;
    } catch (error) {
        console.error("Send error:", error);
        return false;
    }
}

exports.send_otp_email = async (email, otp) => {
    try {
        const templatePath = path.join(__dirname, "otp_email.html");
        let html = fs.readFileSync(templatePath, "utf8");

        html = html.replace("{{OTP}}", otp);

        // await transporter.sendMail({
        //     from: `"E-Commerce App" <${process.env.SMTP_USER}>`,
        //     to: email,
        //     subject: "Email Verification OTP",
        //     html,
        // });

        const send = this.sendEmail(email, "Email Verification OTP", html)

        if (send) {
            return true;
        } else {
            throw error("Mail not send")
        }
    } catch (error) {
        console.error("SMTP error:", error);
        return false;
    }
};