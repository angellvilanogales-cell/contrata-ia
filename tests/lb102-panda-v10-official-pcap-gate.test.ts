import {describe,expect,it} from "vitest";
import {createInMemoryEditableTemplateBinaryStore} from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import {generatePandaSourceBackedPilotPackage} from "../src/application/intake/lb102/PandaSourceBackedPilotPackageGenerator";
import {LB102_SUPPLY_PANDA} from "../src/application/operations/lb102/RealSupplyPilotSnapshots";

describe("LB102 Panda V10 PCAP oficial",()=>{
 it("bloquea generación si no existe el modelo oficial ASO acreditado",async()=>{
  const store=createInMemoryEditableTemplateBinaryStore([]);
  const out=await generatePandaSourceBackedPilotPackage({record:LB102_SUPPLY_PANDA,templateStore:store});
  expect(out.ready).toBe(false);expect(out.bytes).toBeNull();expect(out.blockers.join(" ")).toMatch(/modelo oficial PCAP Suministro.*abierto simplificado ordinario/i);
 });
});
