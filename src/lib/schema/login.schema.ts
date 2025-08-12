import { z } from "zod";

export const LoginUserSchema = z.object({
    phone : z.string().min(1, {message : "Phone number is required"}),
    password : z.string().min(6, {message : "Password should be at least 6 characters."})
})

export type LoginUserSchemaInput = z.infer<typeof LoginUserSchema>;