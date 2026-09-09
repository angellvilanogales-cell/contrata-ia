import {describe,expect,it} from "vitest";
import {assertReviewedPackageSha,parseExpectedPackageSha256} from "../src/application/operations/lb102/LB102PilotReviewIntegrity";

describe("LB102 · integridad de revisión humana",()=>{
 it("normaliza y valida un SHA-256 esperado",()=>{
  const sha="A".repeat(64);
  expect(parseExpectedPackageSha256(sha)).toBe("a".repeat(64));
  expect(()=>parseExpectedPackageSha256("abc")).toThrow(/SHA-256 esperado/i);
 });

 it("solo admite revisión cuando el SHA regenerado coincide exactamente con el inspeccionado",()=>{
  const sha="b".repeat(64);
  expect(()=>assertReviewedPackageSha(sha,sha)).not.toThrow();
  expect(()=>assertReviewedPackageSha(sha,"c".repeat(64))).toThrow(/ya no coincide/i);
 });
});
