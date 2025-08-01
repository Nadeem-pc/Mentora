import { env } from "@/config/env.config";
import { transporter } from "@/config/nodemailer.config";

export const sendOtpEmail = async (email: string, otp: string) => {
    try {
        const mailOptions = {
            from: `"Mentora" <${env.SENDER_EMAIL}>`,
            to: email,
            subject: "Mentora OTP Verification",
            html: `
                <h1>OTP Verification</h1>
                <p>Your OTP is: ${otp}</p>
                <p>Use this OTP to verify your email. Do not share it with anyone.</p><br />
                <p>If you did not request this verification, you can ignore this email.</p>
                <p>~ Mentora</p>
                `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending verification email: ", error);
        throw new Error("Error sending Otp email");
    }
};