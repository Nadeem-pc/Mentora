import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, { message: "Please enter your email" }).email({ message: "Invalid email address "}),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Password must include at least one lowercase letter.")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
        .regex(/[0-9]/, "Password must include at least one digit")
        .regex(/[^a-zA-Z0-9]/, "Password must include at least one special character")
})

const nameSchema = z
  .string()
  .min(3, "Must be at least 3 characters")
  .max(20, "Must be at most 20 characters")
  .regex(/^[A-Za-z]+$/, "Must contain only letters with no spaces");


export const registerSchema = z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    
    email: z
        .string()
        .min(1, { message: "Please enter your email" })
        .email({ message: "Invalid email address "}),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Password must include at least one lowercase letter.")
        .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
        .regex(/[0-9]/, "Password must include at least one digit")
        .regex(/[^a-zA-Z0-9]/, "Password must include at least one special character"),

    confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});