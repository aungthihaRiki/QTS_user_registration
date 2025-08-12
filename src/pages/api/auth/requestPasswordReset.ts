import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
// import { initMiddleware } from "@/lib/init-middleware";
// import { cors } from "@/lib/cors";
import { validateRequest } from "./utils/validateRequest";
import z from "zod";

// const runCors = initMiddleware(cors);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // await runCors(req, res);

  switch (req.method) {
    case "PATCH":
      return requestPasswordResetStatus(req, res);
    default:
      res.setHeader("Allow", ["PATCH"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// todo: action for admin role only
async function requestPasswordResetStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validation = validateRequest(
      z.object({
        phone: z.string().min(1, { message: "Phone number is required" }),
        passwordResetRequestStatus: z.string().min(1, { message: "Password Reset Status is required" }),
      }),
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Errors",
        errors: validation.errors,
      });
    }

    const { phone , passwordResetRequestStatus } = req.body;
    

    const user = await prisma.user.update({
        where: {
            phone
        },
        data: {
            passwordResetRequest: passwordResetRequestStatus,
        }
    })

    return res.status(200).json({ message: "Password Reset Request updated Successfully.", user: user });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
