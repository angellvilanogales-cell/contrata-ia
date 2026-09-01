import {describe,expect,it} from "vitest";
import fs from "node:fs";
import {LB102_BINARY_CHUNK_BYTES,LB102_PROTECTED_SOURCE_GROUPS,parseLB102ProtectedSourceGroup,parseLB102ProtectedSourceKind} from "../src/application/intake/lb102/LB102ProtectedSourceIngress";

describe("LB102 transporte binario protegido automatizado",()=>{
 it("usa fragmentos por debajo del límite servidor y mantiene cuatro allowlists cerradas",()=>{
  expect(LB102_BINARY_CHUNK_BYTES).toBe(192*1024);
  expect(LB102_BINARY_CHUNK_BYTES).toBeLessThanOrEqual(256*1024);
  expect(Object.keys(LB102_PROTECTED_SOURCE_GROUPS)).toEqual(["ferreteria","panda","service-huelva","service-sevilla"]);
  for(const group of Object.values(LB102_PROTECTED_SOURCE_GROUPS)){
   expect(group.neverGeneralModel).toBe(true);
   expect(group.assets.length).toBeGreaterThan(0);
   expect(new Set(group.assets.map(x=>`${x.kind}:${x.templateId}`)).size).toBe(group.assets.length);
  }
 });

 it("rechaza grupos y tipos fuera de allowlist",()=>{
  expect(parseLB102ProtectedSourceGroup("otro")).toBeNull();
  expect(parseLB102ProtectedSourceKind("pdf")).toBeNull();
  expect(parseLB102ProtectedSourceKind("pcap")).toBe("PCAP");
 });

 it("implementa staging, abort y promoción solo tras verificación final",()=>{
  const source=fs.readFileSync("src/application/intake/lb102/LB102ProtectedSourceIngress.ts","utf8");
  expect(source).toContain("/template-ingest/start");
  expect(source).toContain("/chunks/${index}");
  expect(source).toContain("/finalize");
  expect(source).toContain('method:"DELETE"');
  expect(source).toContain("payload.sha256!==descriptor.sha256");
  expect(source).toContain("recovered.bytes.byteLength!==bytes.byteLength");
  expect(source).toContain("sha256(recovered.bytes)!==descriptor.sha256");
 });
});
