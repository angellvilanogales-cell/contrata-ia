import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Json } from "../src/application/universal/UniversalDurableCaseStore";

describe("LB92 canonical checksum", () => {
  it("produce el mismo JSON canónico aunque cambie el orden de claves", () => {
    const left = { z: 1, a: { y: 2, x: 3 }, list: [{ b: 2, a: 1 }] };
    const right = { list: [{ a: 1, b: 2 }], a: { x: 3, y: 2 }, z: 1 };
    expect(canonicalJson(left)).toBe(canonicalJson(right));
  });

  it("produce el mismo SHA-256 tras una reordenación equivalente de JSONB", async () => {
    const before = {
      kind: "UNIVERSAL_EVIDENCE_RECORD",
      record: {
        caseId: "REG-SUPPLY-PERSISTENCE-001",
        fields: {
          object: {
            value: "Prueba LB92 de persistencia universal durable",
            status: "SOURCE_DECLARED",
            humanValidated: false,
          },
        },
      },
    };
    const afterJsonb = {
      record: {
        fields: {
          object: {
            humanValidated: false,
            status: "SOURCE_DECLARED",
            value: "Prueba LB92 de persistencia universal durable",
          },
        },
        caseId: "REG-SUPPLY-PERSISTENCE-001",
      },
      kind: "UNIVERSAL_EVIDENCE_RECORD",
    };
    expect(await sha256Json(before)).toBe(await sha256Json(afterJsonb));
  });
});
