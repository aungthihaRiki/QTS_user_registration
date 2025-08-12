import z from "zod";
import * as argon2 from 'argon2';
import { NextApiRequest, NextApiResponse } from "next";
// import { initMiddleware } from "@/lib/init-middleware";
// import { cors } from "@/lib/cors";
import { validateRequest } from "./utils/validateRequest";
import {
  LoginUserSchema,
  LoginUserSchemaInput,
} from "@/lib/schema/login.schema";
import { getUserByPhone } from "./utils/user";
import { createJwtToken } from "./utils/jwt/createToken";
// const runCors = initMiddleware(cors);
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // await runCors(req, res);

  switch (req.method) {
    case "POST":
      return userLogin(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const userLogin = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const validation = validateRequest(LoginUserSchema, req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Errors",
        errors: validation.errors,
      });
    }

    const userData: LoginUserSchemaInput = validation.data;

    const existingUserByPhone = await getUserByPhone(userData.phone);
    if (!existingUserByPhone)
      return res.status(404).json({ message: "User not found.", token: "" });

    const isValidPassword = await argon2.verify(
      existingUserByPhone.password, // hashed pw
      userData.password // entered pw
    );

    if (!isValidPassword)
      return res.status(401).json({ message: "Incorrect Password!", token: "" });

    const token = createJwtToken(
      existingUserByPhone.id,
      existingUserByPhone.phone,
      existingUserByPhone.userType
    );

    return res.status(200).json({
      message: "Login Successfully",
      token,
      user: {
        id: existingUserByPhone.id,
        phone: existingUserByPhone.phone,
        role: existingUserByPhone.userType,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
