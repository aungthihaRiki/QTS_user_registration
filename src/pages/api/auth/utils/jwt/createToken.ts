import { UserType } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!; // Store securely in .env
const JWT_EXPIRES_IN = '1h'; // Customize as needed

export function createJwtToken( id: string, phone: string, role?: UserType ) {
  return jwt.sign(
    {
      id: id,
      phone: phone,
      role: role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}
