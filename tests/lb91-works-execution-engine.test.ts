import { describe, expect, it } from "vitest";
import { UniversalWorksExecutionEngine } from "../src/engines/UniversalWorksExecutionEngine";

const engine = new UniversalWorksExecutionEngine();
const base = {
  settingOutCheckActRequired: true,
  settingOutCheckDeadlineDaysFromFormalization: 30,
  worksDirectorIdentified: true,
  executionSubjectToApprovedProject: true,
  certificationFrequency: "MONTHLY" as const,
  receptionProcedureDefined: true,
  finalCertificationApprovalMonths: 3,
  guaranteePeriodDefined: true,
  hiddenDefectsLiabilityAcknowledged: true,
};

describe("LB91.25 - ejecución específica de obras", () => {
  it("acepta estructura ordinaria completa", () => {
    expect(engine.evaluate(base).valid).toBe(true);
  });

  it("bloquea replanteo tardío no justificado", () => {
    const result = engine.evaluate({ ...base, settingOutCheckDeadlineDaysFromFormalization: 45 });
    expect(result.valid).toBe(false);
    expect(result.blockers.some(item => item.includes("supera un mes"))).toBe(true);
  });

  it("no confunde certificaciones mensuales con recepción", () => {
    const result = engine.evaluate(base);
    expect(result.warnings.some(item => item.includes("pagos a cuenta"))).toBe(true);
  });

  it("solo permite hasta cinco meses de certificación final en el supuesto complejo habilitado", () => {
    const valid = engine.evaluate({ ...base, finalCertificationApprovalMonths: 5, complexWorksOverTwelveMillionEuros: true, extendedFinalCertificationDeadlineExpresslyProvidedInPcap: true });
    const invalid = engine.evaluate({ ...base, finalCertificationApprovalMonths: 5, complexWorksOverTwelveMillionEuros: false });
    expect(valid.valid).toBe(true);
    expect(invalid.valid).toBe(false);
  });
});
