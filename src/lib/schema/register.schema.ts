import { z } from "zod";

export const RegisterUserSchema  = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    userType : z.enum(["BUYER", "SELLER", "ADMIN"], {message : "User type is required"}),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;