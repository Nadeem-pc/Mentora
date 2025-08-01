import { z } from "zod";

const nameSchema = z
.string()
.min(3, "Must be at least 3 characters")
.max(20, "Must be at most 20 characters")
.regex(/^[A-Za-z]+$/, "Must contain only letters with no spaces");


export const authFormSchema = (type: FormType) => {
    return z.object({
        firstName:
            type === "register"
            ? nameSchema
            : z.string().optional().or(z.literal("")),

        lastName:
            type === "register"
            ? nameSchema
            : z.string().optional().or(z.literal("")),

        email: z
            .string()
            .min(1, { message: "Email is required" })
            .email({ message: "Invalid email address" }),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one digit")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),

        confirmPassword:
            type === "register"
            ? z.string().min(1, "Please confirm your password")
            : z.string().optional().or(z.literal("")),
    })
    .refine((data) => {
        if (type === "register") {
            return data.password === data.confirmPassword;
        }
        return true;
    },
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
};