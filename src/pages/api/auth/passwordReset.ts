import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
// import { initMiddleware } from "@/lib/init-middleware";
// import { cors } from "@/lib/cors";
import { validateRequest } from "./utils/validateRequest";
import z from "zod";
import * as argon2 from "argon2";

// const runCors = initMiddleware(cors);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // await runCors(req, res);

  switch (req.method) {
    case "POST":
      return passwordReset(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// later:get token params from generated url
async function passwordReset(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validation = validateRequest(
      z.object({
        phone: z.string().min(1, { message: "phone is required" }),
        newPassword: z.string().min(1, { message: "New Password is required" }),
        token: z.string().min(1, { message: "Token is required" }),
      }),
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Errors",
        errors: validation.errors,
      });
    }
    const { phone, newPassword, token } = req.body;

    const resetData = await prisma.passwordReset.findFirst({
      where: {
        phone: phone,
      },
    });

    if (
      !resetData ||
      resetData.token !== token ||
      resetData.tokenExpireDate < new Date().toISOString()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const passwordHash = await argon2.hash(newPassword);

    const user = await prisma.user.update({
      where: {
        phone: phone,
      },
      data: {
        password: passwordHash,
        passwordResetRequest: "No",
      },
    });

    const removePwRest = await prisma.passwordReset.deleteMany({
      where: {
        phone: phone,
      },
    });

    return res.status(200).json({ message: "Password Reset Successfully." });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
