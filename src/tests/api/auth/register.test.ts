import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest } from "next";
import handler from "@/pages/api/auth/register";
import { createMockRes } from "../../_mocks_/mockRes";

// vi.mock () => Replace real module with fake one
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),  // vi.fn() => create fake mock function
    },
  },
}))

vi.mock('argon2', () => ({
  hash: vi.fn(),
}))

vi.mock('@/pages/api/auth/utils/user', () => ({
  getUserByEmail: vi.fn(),  // create fake mock function
  getUserByPhone: vi.fn(),
}))

vi.mock('@/pages/api/auth/utils/validateRequest', () => ({
  validateRequest: vi.fn(),
}))

// Import mocks
import { prisma } from "@/lib/prisma";
import { getUserByEmail, getUserByPhone } from "@/pages/api/auth/utils/user";
import {validateRequest}  from "@/pages/api/auth/utils/validateRequest";
import * as argon2 from "argon2";

describe("POST /api/auth/register", () => {
  const mockUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "1234567890",
    password: "password123",
    userType: "BUYER",
  };

  // beforeEach => Rest or prepare state before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // test for validateRequest ( Zod schema validation )
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

  // test for getUserByPhone and getUserByEmail
  it("should return 409 if user already exists", async () => {
    // mockReturnValue => Simulate sync return value
    (validateRequest as any).mockReturnValue({ success: true, data: mockUser });    

    // mockResolvedValue => Simulate async return value
    (getUserByPhone as any).mockResolvedValue({ id: 1 });
    (getUserByEmail as any).mockResolvedValue(null);

    const req = { method: "POST", body: mockUser } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "User already exists." });
  });

  // test for create user
  it("should return 200 and create user successfully", async () => {
    (validateRequest as any).mockReturnValue({ success: true, data: mockUser });
    (getUserByPhone as any).mockResolvedValue(null);
    (getUserByEmail as any).mockResolvedValue(null);
    (argon2.hash as any).mockResolvedValue("hashed-password");
    (prisma.user.create as any).mockResolvedValue({ id: 1, ...mockUser });

    const req = { method: "POST", body: mockUser } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(argon2.hash).toHaveBeenCalledWith("password123");
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firstName: "John",
        email: "john@example.com",
        phone: "1234567890",
        userType: "BUYER",
      }),
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User is registered successfully",
      user: { id: 1, ...mockUser },
    });
  });

  // test for unexpected error
  it("should return 500 on unexpected error", async () => {
    (validateRequest as any).mockReturnValue({ success: true, data: mockUser });
    (getUserByPhone as any).mockRejectedValue(new Error("DB down"));

    const req = { method: "POST", body: mockUser } as NextApiRequest;
    const res = createMockRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
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