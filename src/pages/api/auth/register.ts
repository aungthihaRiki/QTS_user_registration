import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
// import { initMiddleware } from "@/lib/init-middleware";
// import { cors } from "@/lib/cors";
import {
  RegisterUserInput,
  RegisterUserSchema,
} from "@/lib/schema/register.schema";
import { getUserByEmail, getUserByPhone } from "./utils/user";
import { validateRequest } from "./utils/validateRequest";
import * as argon2 from "argon2";

// const runCors = initMiddleware(cors);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // await runCors(req, res);

  switch (req.method) {
    case "POST":
      return userRegister(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function userRegister(req: NextApiRequest, res: NextApiResponse) {
  try {
    const validation = validateRequest(RegisterUserSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Errors",
        errors: validation.errors,
      });
    }

    const userData: RegisterUserInput = validation.data;

    const existingUserByPhone = await getUserByPhone(userData.phone);
    const existingUserByEmail = await getUserByEmail(userData.phone);
    
    if (existingUserByEmail || existingUserByPhone)
      return res.status(409).json({ message: "User already exists." });

    const passwordHash = await argon2.hash(userData.password);

    const newUser = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: passwordHash,
        userType: userData.userType,
      },
    });

    return res
      .status(200)
      .json({ message: "User is registered successfully", user: newUser });
  } catch (err: any) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
