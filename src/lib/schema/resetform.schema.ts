import { z } from "zod";

export const ResetFormSchema = z.object({
    phone: z.string().min(1, { message: "Phone number is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    token: z.string().min(1, { message: "Token is required" }),
});

//for web form validation
export const formSchema = z.object({
    phone: z
        .string()
        .nonempty("* Phone is required"),
    password: z.string().nonempty("* Password is required"),
    confirmPassword: z.string().nonempty("* Confirm Password is required"),

}).refine((data) => data.password === data.confirmPassword, {
    message: "* Passwords do not match",
    path: ["confirmPassword"],
});

export type ResetFormInput = z.infer<typeof ResetFormSchema>;