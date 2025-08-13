import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest } from "next";
import handler from "@/pages/api/auth/register";
import { createMockRes } from "../../_mocks_/mockRes";

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}))

vi.mock('argon2', () => ({
  hash: vi.fn(),
}))

vi.mock('@/server/api/utils/user', () => ({
  getUserByEmail: vi.fn(),
  getUserByPhone: vi.fn(),
}))

vi.mock('@/pages/api/auth/utils/validateRequest', () => ({
  validateRequest: vi.fn(),
}))

// Import mocks
// import { prisma } from "@/lib/prisma";
// import { getUserByEmail, getUserByPhone } from "@/pages/api/auth/utils/user";
import {validateRequest}  from "@/pages/api/auth/utils/validateRequest";
// import * as argon2 from "argon2";

describe("POST /api/auth/register", () => {
  const mockUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "1234567890",
    password: "password123",
    userType: "BUYER",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 on validation error", async () => {
    (validateRequest as any).mockReturnValue({
      success: false,
      errors: ["Invalid data"],
    });

    const req = { method: "POST", body: {} } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation Errors",
      errors: ["Invalid data"],
    });
  });
});