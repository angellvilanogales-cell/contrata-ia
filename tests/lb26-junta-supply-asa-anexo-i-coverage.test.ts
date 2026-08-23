import { describe, expect, it } from "vitest";
import {
  CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS,
  evaluateContr2026240267AnexoICoverage,
} from "../src/application/intake/lb26/JuntaSupplyAsaAnexoICoverage";

describe("LB26 - cobertura física Anexo I suministro ASA", () => {
  it("preserva como cubiertos los bindings ya verificados contra el ODT original", () => {
    const covered = CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.filter(item => item.status === "PHYSICALLY_BOUND");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.1.objeto");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.1.cpv");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.1A.divisionLotes");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.2.valorEstimado");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.3.duracion");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.3.prorrogas");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.7.criterios");
    expect(covered.map(item => item.slotId)).toContain("pcap.anexoI.8.condicionesEspeciales");
  });

  it("mantiene PBL inicial, IVA, total y presupuesto máximo DA33 como conceptos distintos", () => {
    const pbl = CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.find(item => item.slotId === "pcap.anexoI.2A.pblExVat");
    const vat = CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.find(item => item.slotId === "pcap.anexoI.2A.iva");
    const incVat = CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.find(item => item.slotId === "pcap.anexoI.2A.pblIncVat");
    const da33 = CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.find(item => item.slotId === "pcap.anexoI.1C.da33");
    expect(pbl?.targetCaseValue).toBe("10.552,44 €");
    expect(vat?.targetCaseValue).toBe("2.216,01 €");
    expect(incVat?.targetCaseValue).toBe("12.768,45 €");
    expect(da33?.note).toMatch(/maximumApprovedBudgetCents no equivale/i);
  });

  it("no reutiliza campos aproximados para la justificación de no división", () => {
    const justification = CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.find(item => item.slotId === "pcap.anexoI.1A.justificacionNoDivision");
    expect(justification?.status).toBe("UNIVERSAL_FIELD_MISSING");
    expect(justification?.blocking).toBe(true);
    expect(justification?.note).toMatch(/No debe reutilizarse technicalPurpose/i);
  });

  it("bloquea el renderizado físico completo hasta cubrir todos los campos del caso real", () => {
    const evaluation = evaluateContr2026240267AnexoICoverage();
    expect(evaluation.readyForFullPhysicalRendering).toBe(false);
    expect(evaluation.total).toBeGreaterThan(20);
    expect(evaluation.physicallyBound).toBeGreaterThanOrEqual(8);
    expect(evaluation.blockers.some(item => item.slotId === "pcap.anexoI.2B.metodoCalculo")).toBe(true);
    expect(evaluation.blockers.some(item => item.slotId === "pcap.anexoI.14.modificacionPrevista")).toBe(true);
  });
});
