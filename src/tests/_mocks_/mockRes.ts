import type { NextApiResponse } from "next";
import { vi } from "vitest";

export function createMockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res as NextApiResponse;
}

// createMockRes function is a custom mock factory that creates a fake NextApiResponse object with mocked methods. It’s a clean, reusable way to simulate how res behaves in a Next.js API route, without needing a real server.