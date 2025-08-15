// tests/hello.test.ts
import { describe, it, expect, vi } from 'vitest';
import handler from '../../pages/api/hello';
import type { NextApiRequest, NextApiResponse } from 'next';

function createMockRes() {
  const res: Partial<NextApiResponse> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as NextApiResponse;
}

describe('GET /api/hello', () => {
  it('should return Hello World', () => {
    const req = {} as NextApiRequest;
    const res = createMockRes();

    handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Hello World' });
  });
});
