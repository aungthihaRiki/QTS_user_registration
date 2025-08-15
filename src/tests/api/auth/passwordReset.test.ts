import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest } from "next";
import handler from "@/pages/api/auth/passwordReset";
import { createMockRes } from "../../_mocks_/mockRes";

// Mocks
vi.mock("@/lib/prisma", () => ({
  prisma: {
    passwordReset: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/pages/api/auth/utils/validateRequest", () => ({
  validateRequest: vi.fn(),
}));

vi.mock("argon2", () => ({
  hash: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { validateRequest } from "@/pages/api/auth/utils/validateRequest";
import { hash } from "argon2";

describe("POST /api/auth/resetPassword", () => {
  const mockBody = {
    phone: "0999999999",
    newPassword: "newSecret123",
    token: "valid-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 on validation error", async () => {
    (validateRequest as any).mockReturnValue({
      success: false,
      errors: ["Missing fields"],
    });

    const req = { method: "POST", body: {} } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation Errors",
      errors: ["Missing fields"],
    });
  });

  it("should return 400 if token is invalid or expired", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: mockBody,
    });

    (prisma.passwordReset.findFirst as any).mockResolvedValue({
      token: "wrong-token",
      tokenExpireDate: new Date(Date.now() - 1000).toISOString(), // expired
    });

    const req = { method: "POST", body: mockBody } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
  });

  it("should return 200 on successful password reset", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: mockBody,
    });

    (prisma.passwordReset.findFirst as any).mockResolvedValue({
      token: mockBody.token,
      tokenExpireDate: new Date(Date.now() + 10000).toISOString(), // valid
    });

    (hash as any).mockResolvedValue("hashedPassword");

    (prisma.user.update as any).mockResolvedValue({ id: 1});
    (prisma.passwordReset.deleteMany as any).mockResolvedValue({ count: 1 });

    const req = { method: "POST", body: mockBody } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(hash).toHaveBeenCalledWith(mockBody.newPassword);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { phone: mockBody.phone },
      data: {
        password: "hashedPassword",
        passwordResetRequest: "No",
      },
    });
    expect(prisma.passwordReset.deleteMany).toHaveBeenCalledWith({
      where: { phone: mockBody.phone },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password Reset Successfully.",
    });
  });

  it("should return 500 on unexpected error", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: mockBody,
    });

    (prisma.passwordReset.findFirst as any).mockRejectedValue(
      new Error("DB error")
    );

    const req = { method: "POST", body: mockBody } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it("should return 405 for non-POST method", async () => {
    const req = { method: "GET" } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith("Method GET Not Allowed");
  });
});
