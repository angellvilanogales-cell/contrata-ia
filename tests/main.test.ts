import { describe, expect, it } from "vitest";
import { createApplication } from "../src/main";

describe("Contrata-IA entrypoint", () => {
  it("initializes the application through the canonical architecture", () => {
    expect(createApplication()).toEqual({
      name: "contrata-ia",
      version: "0.1.0",
      status: "initialized",
      architectureVersion: "2.2.0",
      canonicalComponents: 12,
      environment: "test"
    });
  });
});
