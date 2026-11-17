import { describe, expect, it } from "vitest";
import { evaluateCapacityAndSolvency } from "../src/application/intake/lb110/CapacityAndSolvencyEngine";

const base = { contractType: "SUPPLY" as const, procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO" as const, object: "Suministro de materiales de ferretería", specificProfessionalAuthorizationRequired: false };

describe("LB110 · capacidad, habilitación y solvencia", () => {
  it("cumplimenta expresamente todos los elementos aunque no se exija acreditar solvencia", () => {
    const result = evaluateCapacityAndSolvency(base);
    expect(result.regime).toBe("SOLVENCY_ACCREDITATION_EXEMPT");
    expect(result.documentaryStatements).toHaveLength(6);
    expect(result.documentaryStatements.every(x => x.text.trim().length > 0)).toBe(true);
    expect(result.documentaryStatements.find(x => x.element === "ECONOMIC_SOLVENCY")).toMatchObject({ status: "NOT_REQUIRED", destinations: ["MEMORY", "PCAP"] });
    expect(result.documentaryStatements.find(x => x.element === "TECHNICAL_SOLVENCY")?.text).toContain("159.6.b");
    expect(result.documentaryStatements.find(x => x.element === "PROFESSIONAL_AUTHORIZATION")?.text).toContain("No se exige habilitación");
    expect(result.documentaryStatements.find(x => x.element === "CLASSIFICATION")?.text).toContain("No se exige clasificación");
  });

  it("distingue exención de solvencia de capacidad, prohibiciones y habilitación", () => {
    const result = evaluateCapacityAndSolvency({ ...base, specificProfessionalAuthorizationRequired: true, professionalAuthorizationDetail: "Inscripción sectorial vigente." });
    expect(result.documentaryStatements.find(x => x.element === "CAPACITY")?.status).toBe("APPLIES");
    expect(result.documentaryStatements.find(x => x.element === "PROHIBITIONS")?.status).toBe("APPLIES");
    expect(result.documentaryStatements.find(x => x.element === "PROFESSIONAL_AUTHORIZATION")?.status).toBe("APPLIES");
  });
  it("redacta por separado la habilitación comprobada de cada lote", () => {
    const result = evaluateCapacityAndSolvency({ ...base, specificProfessionalAuthorizationRequired: true, professionalAuthorizationByLot: [
      { lot: "Lote 1", required: false },
      { lot: "Lote 2", required: true, detail: "Inscripción exigida por la norma sectorial acreditada" },
    ] });
    const statement = result.documentaryStatements.find(x => x.element === "PROFESSIONAL_AUTHORIZATION");
    expect(statement?.text).toContain("Lote 1: no se ha identificado habilitación específica");
    expect(statement?.text).toContain("Lote 2: se exige Inscripción");
  });

  it("exige requisito, medio y motivación en procedimientos sin exención", () => {
    expect(() => evaluateCapacityAndSolvency({ ...base, procedure: "ABIERTO" })).toThrow(/requisito de solvencia económica/);
    const result = evaluateCapacityAndSolvency({ ...base, procedure: "ABIERTO_SIMPLIFICADO", economicRequirement: "Volumen anual mínimo expresamente fijado.", economicEvidence: "Cuentas anuales.", technicalRequirement: "Experiencia en suministros similares.", technicalEvidence: "Relación y certificados.", proportionalityReason: "Los requisitos guardan relación con el volumen y complejidad del suministro." });
    expect(result.regime).toBe("SOLVENCY_REQUIREMENTS_REQUIRED");
    expect(result.documentaryStatements.filter(x => x.status === "APPLIES")).toHaveLength(4);
  });

  it("documenta también la no exigencia específica en contrato menor", () => {
    const result = evaluateCapacityAndSolvency({ ...base, procedure: "CONTRATO_MENOR" });
    expect(result.regime).toBe("MINOR_CONTRACT_APTITUDE");
    expect(result.documentaryStatements.find(x => x.element === "ECONOMIC_SOLVENCY")?.text).toContain("No se establecen requisitos específicos");
  });
});
