import { describe, expect, it } from "vitest";
import { LB120_DOCUMENT_CONCLUSION_SCRIPT } from "../src/interfaces/lb103/LB120DocumentConclusionScript";

describe("LB120 · interfaz de cierre", () => {
  it("entrega un script válido al navegador", () => {
    expect(() => new Function(LB120_DOCUMENT_CONCLUSION_SCRIPT)).not.toThrow();
  });

  it("separa las decisiones validadas de la disponibilidad de modelos", () => {
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("preflightMessage");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("Decisiones del expediente completas y validadas");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("Estado de los documentos");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("Modelo pendiente de verificar");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("La falta de un modelo no modifica el estado de los pasos 1 a 7");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("No se sustituirá el modelo oficial");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).not.toContain("Complete y valide todas las decisiones antes del cierre");
  });

  it("conserva un estado documental pendiente sin devolver el expediente al paso 7", () => {
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain('s.status=pf.documentState==="MODELOS_PENDIENTES"?"MODEL_PENDING":"REVIEW"');
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("s.decisionStatus=pf.decisionState");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("s.documentStatus=");
  });

  it("exige vista previa, seis confirmaciones y validación del registro", () => {
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("lb120-preview");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("lb120-consent");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("officialPcapIntegrityConfirmed");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("closure.finalConsentRecord");
    expect(LB120_DOCUMENT_CONCLUSION_SCRIPT).toContain("universal-evidence");
  });
});
