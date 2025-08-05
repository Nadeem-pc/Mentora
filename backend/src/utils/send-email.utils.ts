import { env } from "@/config/env.config";
import { transporter } from "@/config/nodemailer.config";

export const sendOtpEmail = async (email: string, otp: string) => {
    try {
        const mailOptions = {
            from: `"Mentora" <${env.SENDER_EMAIL}>`,
            to: email,
            subject: "Verify Your Email - Mentora",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>OTP Verification - Mentora</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; font-family: 'Poppins', sans-serif;">
                                MENTORA
                            </h1>
                            <p style="color: #a7f3d0; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                                Your Mental Health Partner
                            </p>
                        </div>

                        <!-- Main Content -->
                        <div style="padding: 40px 30px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">
                                    Email Verification Required
                                </h2>
                                <p style="color: #64748b; margin: 0; font-size: 16px;">
                                    Please use the verification code below to complete your registration
                                </p>
                            </div>

                            <!-- OTP Display -->
                            <div style="text-align: center; margin: 30px 0;">
                                <div style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);">
                                    <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
                                        Your Verification Code
                                    </p>
                                    <div style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 10px 0; letter-spacing: 4px; font-family: 'Courier New', monospace;">
                                        ${otp}
                                    </div>
                                </div>
                            </div>

                            <!-- Instructions -->
                            <div style="background-color: #ecfdf5; border-left: 4px solid #14b8a6; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                                    Important Instructions:
                                </h3>
                                <ul style="color: #64748b; margin: 0; padding-left: 20px; font-size: 14px;">
                                    <li style="margin-bottom: 5px;">Enter this code in the verification field on Mentora</li>
                                    <li style="margin-bottom: 5px;">This code will expire in 1 minute</li>
                                    <li style="margin-bottom: 5px;">Never share this code with anyone</li>
                                </ul>
                            </div>

                            <!-- Security Notice -->
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="color: #64748b; font-size: 14px; margin: 0;">
                                    If you didn't request this verification, you can safely ignore this email.
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
                                Thank you for choosing Mentora for your mental health journey
                            </p>
                            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                            <div style="margin-top: 20px;">
                                <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                                    © 2025 Mentora. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending verification email: ", error);
        throw new Error("Error sending Otp email");
    }
};