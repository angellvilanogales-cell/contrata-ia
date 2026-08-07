import { describe, it, expect } from 'vitest';

import { initApp } from '../../src/bootstrap';

describe('smoke bootstrap', () => {
  it('loads knowledge VERSION.yaml without throwing', async () => {
    const status = await initApp();
    // Either it returns ok true or a clear missing dependency message.
    expect(status).toHaveProperty('ok');
  });
});
