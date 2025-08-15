import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";
import { z } from "zod";
import { resetPasswordTemplate } from "@/modules/password-reset/EmailTemplate";

const phoneSchema = z.object({
    phone: z
        .string()
        .min(1, { message: "Phone number is required" })
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // await runCors(req, res);

    switch (req.method) {
        case "POST":
            return passwordRequest(req, res);
        default:
            res.setHeader("Allow", ["POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}


export const passwordRequest = async (req: NextApiRequest, res: NextApiResponse) => {

    try {
        if (req.method !== "POST") return res.status(405).end(`Method ${req.method} Not Allowed`);

        const parsedData = phoneSchema.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(422).json(
                {
                    message: "Validation Errors",
                    errors: parsedData.error.flatten().fieldErrors
                }
            )
        };

        const data = parsedData.data;

        const existingUserByPhone = await prisma.user.findUnique({
            where: {
                phone: data.phone
            }
        });
        if (!existingUserByPhone)
            return res.status(404).json({ message: "User not found." });


        const existingReset = await prisma.passwordReset.findFirst({
            where: { phone: data.phone },
            orderBy: { tokenExpireDate: 'desc' }
        });

        console.log("existingReset", existingReset);

        if (
            existingReset && existingReset.tokenExpireDate &&
            Date.parse(existingReset.tokenExpireDate) > Date.now()
        ) {
            console.log("this function is running ");
            return res.status(429).json({
                message: "We already sent you a password reset link.PLease try again in 1 hour."
            });
        }    

        const token = uuid();
        const tokenExpireDate = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.passwordReset.create({
            data: {
                phone: data.phone,
                token: token,
                tokenExpireDate: tokenExpireDate.toISOString()
            }
        });

        const resetUrl = `http://localhost:3000/resetPassword?token=${token}`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: "QTS Support <qts@mail.com>",
            to: existingUserByPhone.email,
            subject: "Password Reset Request",
            // text: `Click the link below to reset your password: ${resetUrl}`,
            html: resetPasswordTemplate({ firstName: existingUserByPhone.firstName, resetUrl }),
        };

        await transporter.sendMail(mailOptions);


        return res.status(200).json({ message: "Password reset email has been sent." });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error." });
    }
}