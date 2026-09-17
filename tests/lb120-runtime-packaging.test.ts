import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("LB120 runtime packaging", () => {
  it("includes the knowledge base required by the adaptive intake", () => {
    const dockerfile = fs.readFileSync(path.join(process.cwd(), "Dockerfile"), "utf8");

    expect(dockerfile).toMatch(/^COPY knowledge \.\/knowledge$/m);
  });
});
