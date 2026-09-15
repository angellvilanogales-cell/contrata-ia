import { describe, expect, it } from "vitest";
import { auditLB120PriorDecisionEvidence, createLB120DocumentPreview, createLB120FinalConsent, validateLB120FinalConsent } from "../src/application/universal/LB120DocumentConclusion";
import type { LB103ServerValidatedPreflight } from "../src/application/universal/LB103ServerValidatedPreflight";
import type { SupplyUserDocumentPackage } from "../src/application/intake/lb95/SupplyUserDocumentPackageGenerator";

const hash=(letter:string)=>letter.repeat(64);
const preflight={generationReady:true,snapshot:{caseId:"EXP-12345678",sha256:hash("a")},documentarySelection:{sha256:hash("b")}} as unknown as LB103ServerValidatedPreflight;
const pkg={ready:true,sha256:hash("c"),manifest:{crossDocumentAuditReady:true,documents:[{kind:"PCAP",fileName:"PCAP.odt",sha256:hash("d"),provenance:"OFFICIAL_MODEL:JDA-SUPPLY-ASA"},{kind:"MEMORIA",fileName:"Memoria.odt",sha256:hash("e"),provenance:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE"},{kind:"PPT",fileName:"PPT.odt",sha256:hash("f"),provenance:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE"}]}} as unknown as SupplyUserDocumentPackage;

function input(){return{snapshotSha256:hash("a"),documentarySelectionSha256:hash("b"),packageSha256:hash("c"),factsAndDecisionsConfirmed:true,legalGroundsConfirmed:true,crossDocumentConsistencyConfirmed:true,officialPcapIntegrityConfirmed:true,memoryAndPptStructureConfirmed:true,noCriticalBlockersConfirmed:true,finalStatement:"Confirmo motivadamente la coherencia de la terna documental."};}

describe("LB120 · conclusión, coherencia documental y consentimiento final",()=>{
  it("no permite cerrar si falta evidencia humana de un bloque anterior",()=>{expect(auditLB120PriorDecisionEvidence({})).toContain("D01: falta validación humana de object.");});
  it("prepara una vista previa ligada a las huellas de la terna",()=>{const x=createLB120DocumentPreview(preflight,pkg);expect(x.documents.map(d=>d.kind)).toEqual(["PCAP","MEMORIA","PPT"]);expect(x.packageSha256).toBe(hash("c"));expect(x.humanConsentRequired).toBe(true);});
  it("crea consentimiento nominativo solo con todas las confirmaciones",()=>{const preview=createLB120DocumentPreview(preflight,pkg);const record=createLB120FinalConsent(preview,input(),"revisora.a","2026-09-15T10:00:00.000Z");expect(record.consentSha256).toMatch(/^[a-f0-9]{64}$/);expect(record.humanValidated).toBe(true);expect(()=>createLB120FinalConsent(preview,{...input(),officialPcapIntegrityConfirmed:false},"revisora.a")).toThrow(/todos los extremos/);});
  it("rechaza huellas distintas de las reconstruidas",()=>{const preview=createLB120DocumentPreview(preflight,pkg);expect(()=>createLB120FinalConsent(preview,{...input(),packageSha256:hash("9")},"revisora.a")).toThrow(/no coinciden/);});
  it("invalida el consentimiento cuando cambia un documento",()=>{const preview=createLB120DocumentPreview(preflight,pkg);const record=createLB120FinalConsent(preview,input(),"revisora.a","2026-09-15T10:00:00.000Z");const field={key:"closure.finalConsentRecord",value:record,status:"HUMAN_VALIDATED",sources:[],humanValidationRequired:true,humanValidated:true,humanValidation:{by:"revisora.a",at:"2026-09-15T10:00:00.000Z"}} as const;expect(validateLB120FinalConsent(field,preview)).toEqual([]);const changed={...preview,documents:preview.documents.map(d=>d.kind==="PPT"?{...d,sha256:hash("8")}:d)};expect(validateLB120FinalConsent(field,changed)).toContain("La huella consentida de PPT ya no coincide.");});
});
