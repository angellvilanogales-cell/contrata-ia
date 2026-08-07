import { describe, it, expect } from 'vitest';
import { start } from '../../src/main';

describe('smoke bootstrap', () => {
  it('start() returns true', async () => {
    const ok = await start();
    expect(ok).toBe(true);
  });
});
