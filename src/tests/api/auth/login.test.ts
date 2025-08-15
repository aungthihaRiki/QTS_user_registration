import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest } from "next";
import handler from "@/pages/api/auth/login";
import { createMockRes } from "../../_mocks_/mockRes";

// vi.mock => Replace real module with fake one
vi.mock("argon2", () => ({
  verify: vi.fn(),
}));

vi.mock("@/pages/api/auth/utils/user", () => ({
  getUserByPhone: vi.fn(),
}));

vi.mock("@/pages/api/auth/utils/jwt/createToken", () => ({
  createJwtToken: vi.fn(),
}));

vi.mock("@/pages/api/auth/utils/validateRequest", () => ({
  validateRequest: vi.fn(),
}));

// Import mocks
import * as argon2 from "argon2";
import { getUserByPhone } from "@/pages/api/auth/utils/user";
import { createJwtToken } from "@/pages/api/auth/utils/jwt/createToken";
import { validateRequest } from "@/pages/api/auth/utils/validateRequest";

describe("POST /api/auth/login", () => {
  const mockUser = {
    id: 1,
    phone: "0999999999",
    password: "hashed-password",
    userType: "BUYER",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // test for validateRequest (Zod schema validation)
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

  // test for user not found
  it("should return 404 if user is not found", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: { phone: "0999999999", password: "password123" },
    });
    (getUserByPhone as any).mockResolvedValue(null);

    const req = {
      method: "POST",
      body: { phone: "0999999999", password: "password123" },
    } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found.",
      token: "",
    });
  });

  // test for incorrect password
  it("should return 401 if password is incorrect", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: { phone: "0999999999", password: "wrongPassword" },
    });
    (getUserByPhone as any).mockResolvedValue(mockUser);
    (argon2.verify as any).mockResolvedValue(false);

    const req = {
      method: "POST",
      body: { phone: "0999999999", password: "wrongPassword" },
    } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Incorrect Password!",
      token: "",
    });
  });

  // test for successful login
  it("should return 200 and token for valid credentials", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: { phone: "0999999999", password: "correctPassword" },
    });
    (getUserByPhone as any).mockResolvedValue(mockUser);
    (argon2.verify as any).mockResolvedValue(true);
    (createJwtToken as any).mockReturnValue("mockToken");

    const req = {
      method: "POST",
      body: { phone: "0999999999", password: "correctPassword" },
    } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(argon2.verify).toHaveBeenCalledWith(
      "hashed-password",
      "correctPassword"
    );
    expect(createJwtToken).toHaveBeenCalledWith(
      mockUser.id,
      mockUser.phone,
      mockUser.userType
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login Successfully",
      token: "mockToken",
    });
  });

  // test for unexpected error
  it("should return 500 on unexpected error", async () => {
    (validateRequest as any).mockReturnValue({
      success: true,
      data: { phone: "0999999999", password: "password123" },
    });
    (getUserByPhone as any).mockRejectedValue(new Error("DB down"));

    const req = {
      method: "POST",
      body: { phone: "0999999999", password: "password123" },
    } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "DB down" });
  });

  // test for non-POST method
  it("should return 405 for non-POST method", async () => {
    const req = { method: "GET" } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith("Method GET Not Allowed");
  });
});
