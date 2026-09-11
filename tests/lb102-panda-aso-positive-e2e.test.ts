import {describe,expect,it} from "vitest";
import type {EvidenceField} from "../src/domain/expediente/EvidenceField";
import type {UniversalEvidenceRecord} from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import {createInMemoryEditableTemplateBinaryStore} from "../src/application/intake/lb23/UniversalOdtProductionRenderer";
import {generateSupplyAsoUserDocumentPackage} from "../src/application/intake/lb102/SupplyAsoUserDocumentPackageGenerator";
import {PANDA_ASO_PCAP_EXACT} from "./fixtures/lb102-panda-pcap-exact";
import {PANDA_ASO_MEMORY_EXACT} from "./fixtures/lb102-panda-memory-exact";
import {PANDA_ASO_PPT_EXACT} from "./fixtures/lb102-panda-ppt-exact";

function validated(key:string,value:unknown):EvidenceField<unknown>{return{key,value,status:"HUMAN_VALIDATED",sources:[{kind:"PRIMARY_DOCUMENT",sourceId:"REG-SUPPLY-002"}],humanValidationRequired:true,humanValidated:true,diagnostics:["Contraste LB102 con Memoria/PCAP/PPT primarios firmados."]};}
const values:Record<string,unknown>={
 contractType:"SUPPLY",procedure:"ABIERTO_SIMPLIFICADO_ORDINARIO","economic.fundingSource":"AUTOFINANCED","technical.supplyVariant":"ICT_LICENSE_OR_SOFTWARE","technical.hasSuccessiveOrders":false,
 need:"Mantener la protección antimalware corporativa mediante renovación de licencias del producto Panda.",object:"Suministro de licencias de software de seguridad Panda y soporte asociado.",cpvMain:"48760000-3",
 "lots.divisionIntoLots":false,"lots.noDivisionJustification":"La prestación constituye una unidad funcional y técnica vinculada a una única solución de seguridad.",
 baseTenderBudgetCents:6119225,"economic.initialVatAmountCents":1285037,"economic.initialPblVatIncludedCents":7404262,"economic.legalEstimatedValueCents":6119225,
 "economic.estimatedValueCalculationMethod":"Valor estimado declarado en la fuente primaria, sin prórrogas ni modificaciones previstas.","economic.priceDeterminationRegime":"Precios unitarios por componentes/licencias.",
 durationMonths:36,extensionMonths:0,"execution.extensionStructure":"Sin prórroga declarada en la fuente primaria.",
 "criteria.economicSolvency":"Volumen anual de negocios conforme al PCAP del expediente.","criteria.technicalSolvency":"Experiencia y medios técnicos; se exige acreditación Partner Gold del fabricante conforme a la fuente.",
 "criteria.awardCriteria":["Oferta económica y demás criterios automáticos declarados en el expediente"],"execution.specialExecutionConditions":["Condiciones especiales de ejecución según PCAP del expediente"],
 "technical.executionLocations":["Servicios Centrales del Servicio Andaluz de Empleo"],"technical.technicalRequirements":"Renovación de la solución de seguridad, protección antimalware y funcionalidades técnicas definidas en el PPT.",
 "technical.licenseRequirements":"Derechos de uso de las licencias durante 36 meses; compatibilidad y continuidad con la solución instalada; requisito Partner Gold acreditado.","technical.supportRequirements":"Mantenimiento, actualizaciones y soporte durante toda la vigencia contractual según PPT.",
 "execution.receiptAndAcceptanceRegime":"Conformidad previa comprobación de licencias, activación y soporte contratado."
};
const record:UniversalEvidenceRecord={caseId:"CONTR 2025 466864",updatedAt:new Date(0).toISOString(),fields:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,validated(k,v)]))};
const exact=[PANDA_ASO_PCAP_EXACT,PANDA_ASO_MEMORY_EXACT,PANDA_ASO_PPT_EXACT];
const store=createInMemoryEditableTemplateBinaryStore(exact.map(x=>({templateId:x.templateId,sourceId:x.sourceId,bytes:Buffer.from(x.base64,"base64")})));

describe("LB102 Panda ASO software real E2E",()=>{
 it("genera PCAP Memoria PPT completos sin contaminación ASA/ferretería",async()=>{
  const out=await generateSupplyAsoUserDocumentPackage({record,templateStore:store});
  expect(out.blockers).toEqual([]);expect(out.ready).toBe(true);expect(out.bytes?.length).toBeGreaterThan(0);expect(out.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(out.manifest?.profile).toBe("SUPPLY_ASO_SOFTWARE_AUTOFINANCED_LB102");expect(out.manifest?.sourceRegression).toBe("REG-SUPPLY-002");expect(out.manifest?.productionReady).toBe(false);
  expect(out.manifest?.documents.map(x=>x.kind).sort()).toEqual(["MEMORIA","PCAP","PPT"]);expect(out.manifest?.documents.every(x=>x.officialModel===false)).toBe(true);
 });
 it("es determinista para el mismo expediente y fuentes físicas",async()=>{const a=await generateSupplyAsoUserDocumentPackage({record,templateStore:store});const b=await generateSupplyAsoUserDocumentPackage({record,templateStore:store});expect(a.ready).toBe(true);expect(b.ready).toBe(true);expect(a.sha256).toBe(b.sha256);expect(Buffer.from(a.bytes??[]).equals(Buffer.from(b.bytes??[]))).toBe(true);});
 it("bloquea cualquier intento de aplicar DA 33/pedidos sucesivos al perfil Panda",async()=>{
  const contaminated:UniversalEvidenceRecord={...record,fields:{...record.fields,"technical.hasSuccessiveOrders":validated("technical.hasSuccessiveOrders",true)}};
  const out=await generateSupplyAsoUserDocumentPackage({record:contaminated,templateStore:store});expect(out.ready).toBe(false);expect(out.blockers.join(" ")).toMatch(/DA 33/);
 });
 it("bloquea falta de validación humana en un dato documental",async()=>{
  const base=validated("technical.supportRequirements",values["technical.supportRequirements"]);const pending={...base,status:"SOURCE_CONFIRMED" as const,humanValidated:false};
  const invalid:UniversalEvidenceRecord={...record,fields:{...record.fields,"technical.supportRequirements":pending}};
  const out=await generateSupplyAsoUserDocumentPackage({record:invalid,templateStore:store});expect(out.ready).toBe(false);expect(out.blockers.join(" ")).toMatch(/validación humana/);
 });
});
