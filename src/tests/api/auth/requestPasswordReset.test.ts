import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest } from "next";
import handler from "@/pages/api/auth/requestPasswordReset";
import { createMockRes } from "../../_mocks_/mockRes";

// vi.mock => Replace real modules with fakes
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/pages/api/auth/utils/validateRequest", () => ({
  validateRequest: vi.fn(),
}));

// Import mocks
import { prisma } from "@/lib/prisma";
import { validateRequest } from "@/pages/api/auth/utils/validateRequest";

describe("PATCH /api/auth/requestPasswordReset", () => {
  const mockUser = {
    phone: "0999999999",
    passwordResetRequestStatus: "Yes",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // test for validation error
  it("should return 400 on validation error", async () => {
    (validateRequest as any).mockReturnValue({
      success: false,
      errors: ["Invalid data"],
    });

    const req = { method: "PATCH", body: {} } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Validation Errors",
      errors: ["Invalid data"],
    });
  });

  // test for user not found
  it("should return 404 if user not found", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: mockUser,
    });
    (prisma.user.updateMany as any).mockResolvedValue({ count: 0 });

    const req = { method: "PATCH", body: mockUser } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { phone: mockUser.phone },
      data: { passwordResetRequest: mockUser.passwordResetRequestStatus },
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found." });
  });

  // test for successful update
  it("should return 200 when password reset status is updated successfully", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: mockUser,
    });
    (prisma.user.updateMany as any).mockResolvedValue({ count: 1 });

    const req = { method: "PATCH", body: mockUser } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { phone: mockUser.phone },
      data: { passwordResetRequest: mockUser.passwordResetRequestStatus },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password Reset Request updated Successfully.",
      user: { count: 1 },
    });
  });

  // test for unexpected error
  it("should return 500 on unexpected error", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: mockUser,
    });
    (prisma.user.updateMany as any).mockRejectedValue(new Error("DB down"));

    const req = { method: "PATCH", body: mockUser } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });

  // test for non-PATCH method
  it("should return 405 for non-PATCH method", async () => {
    const req = { method: "GET" } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith("Method GET Not Allowed");
  });
});
