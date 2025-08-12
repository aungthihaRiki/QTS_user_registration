import { z } from "zod";

export const RegisterUserSchema  = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;