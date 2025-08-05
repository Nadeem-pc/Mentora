import { HttpResponse } from "@/constants/response-message.constant";
import { z } from "zod";

export const otpSchema = z
    .object({
        email: z.string().email(HttpResponse.INVALID_EMAIL),
        otp: z
        .string()
        .min(4, "OTP must be 4 digits long")
        .max(4, "OTP must be 4 digits long")
        .regex(/^\d+$/, "OTP must contain only numbers")
})
.strict();