import { describe, it, expect, beforeEach, vi } from "vitest";
import handler from "@/pages/api/auth/generateResetToken";
import { prisma } from "@/lib/prisma";
import { validateRequest } from "@/pages/api/auth/utils/validateRequest";
import { getUserByPhone } from "@/pages/api/auth/utils/user";
import { v4 as uuid } from "uuid";
import { createMockRes } from "../../_mocks_/mockRes";
import { NextApiRequest } from "next";

// Mock dependencies first
vi.mock("@/lib/prisma", () => ({
  prisma: {
    passwordReset: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/pages/api/auth/utils/validateRequest", () => ({
  validateRequest: vi.fn(),
}));

vi.mock("@/pages/api/auth/utils/user", () => ({
  getUserByPhone: vi.fn(),
}));

vi.mock("uuid", () => ({
  v4: vi.fn(),
}));

describe("POST /api/auth/generateResetToken", () => {
  const mockUser = {
    id: 1,
    phone: "09999999",
    token: "test-uuid",
    tokenExpireDate: "future-date",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if validation fails", async () => {
    (validateRequest as any).mockReturnValue({
      success: false,
      errors: ["Phone number is required"],
    });

    const req = { method: "POST", body: {} } as NextApiRequest;
    const res = createMockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation Errors",
      errors: ["Phone number is required"],
    });
  });

  it("should return 404 if user not found", async () => {
    (validateRequest as any).mockReturnValue({ success: true });
    (getUserByPhone as any).mockResolvedValue(null);

    const req = {
      method: "POST",
      body: { phone: mockUser.phone },
    } as NextApiRequest;
    const res = createMockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Can't generate token. User not found.",
    });
  });

  it("should return 200 if token generated successfully", async () => {
    (validateRequest as any).mockReturnValue({ success: true });
    (getUserByPhone as any).mockResolvedValue({ id: 1, phone: mockUser.phone });
    (uuid as any).mockReturnValue("test-uuid");
    (prisma.passwordReset.create as any).mockResolvedValue({
      mockUser,
    });

    const req = { method: "POST", body: { phone: mockUser.phone } } as NextApiRequest;
    const res = createMockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token generated Successfully.",
    });
    expect(prisma.passwordReset.create).toHaveBeenCalledWith({
      data: {
        phone: "09999999",
        token: expect.any(String),
        tokenExpireDate: expect.any(String),
      },
    });
  });

  it("should return 500 if an unexpected error occurs", async () => {
    (validateRequest as any).mockReturnValue({ success: true });
    (getUserByPhone as any).mockRejectedValue(new Error("DB error"));
    
    const req = { method: "POST", body: { phone: mockUser.phone } } as NextApiRequest;
    const res = createMockRes();
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal Server Error",
    });
  });

  it("should return 405 if method is not POST", async () => {
    const req = { method: "GET" } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith("Allow", ["POST"]);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith("Method GET Not Allowed");
  });
});
