import { prisma } from "@/lib/prisma";

export const getUserByPhone = async (phone: string) => {
    const user = await prisma.user.findUnique({ where: { phone } });
    return user;
}

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({ where: { email } });
    return user;
}