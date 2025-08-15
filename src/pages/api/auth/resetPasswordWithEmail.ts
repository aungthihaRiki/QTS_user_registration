import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import * as argon2 from 'argon2';
import { ResetFormSchema } from "@/lib/schema/resetform.schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") return res.status(405).end(`Method ${req.method} Not Allowed`);
        const parsedData = ResetFormSchema.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(422).json(
                {
                    message: "Validation Errors",
                    errors: parsedData.error.flatten().fieldErrors
                }
            )
        };

        const data = parsedData.data;

        const resetRecord = await prisma.passwordReset.findFirst({
            where: {
                token: data.token
            }
        });

        if (!resetRecord || !resetRecord.tokenExpireDate || new Date(resetRecord.tokenExpireDate) < new Date()) {
            return res.status(410).json({ message: 'Token invalid or expired' });
        }

        const hashedPassword = await argon2.hash(data.password);

        await prisma.user.update({
            where: { phone: resetRecord.phone },
            data: { password: hashedPassword },
        });

        return res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }

}