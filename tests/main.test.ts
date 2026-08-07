import { describe, expect, it } from "vitest";
import { createApplication } from "../src/main";

describe("Contrata-IA entrypoint", () => {
  it("initializes the application with an explicit status", () => {
    expect(createApplication()).toEqual({
      name: "contrata-ia",
      version: "0.1.0",
      status: "initialized"
    });
  });
});
