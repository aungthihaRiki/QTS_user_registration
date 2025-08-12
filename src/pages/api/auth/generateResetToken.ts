import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
// import { initMiddleware } from "@/lib/init-middleware";
// import { cors } from "@/lib/cors";

import { validateRequest } from "./utils/validateRequest";

import z from "zod";
import { v4 as uuid } from 'uuid';
import { getUserByPhone } from "./utils/user";

// const runCors = initMiddleware(cors);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // await runCors(req, res);

  switch (req.method) {
    case "POST":
      return generateResetToken(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function generateTokenExpiredDate(minutes: number) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toString();
}

async function generateResetToken(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validation = validateRequest(
      z.object({
        phone: z.string().min(1, { message: "Phone number is required" }),
      }),
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Errors",
        errors: validation.errors,
      });
    }

    const { phone } = req.body;

    const existingUserByPhone = await getUserByPhone(phone);
    if (!existingUserByPhone) return res.status(404).json({ message: "Can't generate token. User not found." });
    const token = uuid().toString();

    const data = await prisma.passwordReset.create({
      data: {
        phone: phone,
        token: token,
        tokenExpireDate: generateTokenExpiredDate(60),
      },
    });
    return res.status(200).json({ message: "Token generated Successfully." });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
