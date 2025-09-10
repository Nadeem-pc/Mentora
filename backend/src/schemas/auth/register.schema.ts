import { z } from "zod";
import { HttpResponse } from "../../constants/response-message.constant";

const nameSchema = z
  .string()
  .min(3, "Must be at least 3 characters")
  .max(20, "Must be at most 20 characters")
  .regex(/^[A-Za-z]+$/, "Must contain only letters with no spaces");

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  role: z.string(),
  email: z.string().email(HttpResponse.INVALID_EMAIL),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
})
.strict();