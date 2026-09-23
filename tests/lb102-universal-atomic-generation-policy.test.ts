import {describe,expect,it} from "vitest";
import fs from "node:fs";

const GENERATORS=[
 "src/application/intake/lb95/SupplyUserDocumentPackageGenerator.ts",
 "src/application/intake/lb96/ServiceUserDocumentPackageGenerator.ts",
 "src/application/intake/lb97/WorksUserDocumentPackageGenerator.ts",
 "src/application/intake/lb98/ConcessionUserDocumentPackageGenerator.ts",
 "src/application/intake/lb99/MixedSupplyServiceUserDocumentPackageGenerator.ts",
 "src/application/intake/lb102/PandaSourceBackedPilotPackageGenerator.ts",
 "src/application/intake/lb102/ServiceSourceBackedPilotPackageGenerator.ts",
 "src/application/operations/lb102/FerreteriaPilotPackageGenerator.ts",
] as const;

describe("política universal de generación documental atómica",()=>{
 it("obliga a todas las familias operativas a pasar por el mismo gate",()=>{
  for(const file of GENERATORS){const source=fs.readFileSync(file,"utf8");expect(source,`${file} debe importar el gate atómico`).toContain("assertAtomicDocumentPackage");expect(source,`${file} debe ligar la salida a un snapshot canónico`).toContain("canonicalSnapshot");}
 });
 it("no permite volver al patrón de generación documental aislada en el catálogo LB102",()=>{
  const source=fs.readFileSync("src/application/operations/lb102/LB102PilotPackageCatalog.ts","utf8");expect(source).toContain('atomicDocumentSet');expect(source).toContain('["PCAP","MEMORIA","PPT"]');
 });
});
