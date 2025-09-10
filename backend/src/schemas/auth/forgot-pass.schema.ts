import { z } from "zod";
import { HttpResponse } from "@/constants/response-message.constant";

export const forgotPasswordSchema = z.object({
   email: z.string().trim().email(HttpResponse.INVALID_EMAIL)
});