import {describe,expect,it} from "vitest";
import {evaluateLB102TechnicalPrePilot} from "../src/application/operations/lb102/LB102TechnicalPrePilotStatus";
import {countExecutableRealCases} from "../src/application/operations/lb102/RealCaseRegressionCorpus";

const negatives={negativeRegressionConflictPassed:true,negativeRegressionMissingValidationPassed:true,negativeRegressionTemplateIntegrityPassed:true};
describe("LB102 technical pre-pilot status",()=>{
 it("deriva 2 Supply + 2 Service del corpus y queda técnicamente listo cuando LB101 y la generación desplegada están acreditados",()=>{
  expect(countExecutableRealCases("SUPPLY")).toBeGreaterThanOrEqual(2);expect(countExecutableRealCases("SERVICE")).toBeGreaterThanOrEqual(2);
  const status=evaluateLB102TechnicalPrePilot({lb101SecurityReady:true,deployedGenerationReady:true,...negatives});expect(status.technicalPrePilotReady).toBe(true);expect(status.appViableForPilot).toBe(false);expect(status.productionReady).toBe(false);
  expect(status.blockers).toContain("Se requieren al menos dos sesiones de aceptación funcional con usuarios.");
 });
 it("no autoafirma seguridad del despliegue",()=>{
  const status=evaluateLB102TechnicalPrePilot({lb101SecurityReady:false,deployedGenerationReady:true,...negatives});expect(status.technicalPrePilotReady).toBe(false);expect(status.blockers).toContain("LB101 debe acreditar operación multiusuario segura para piloto.");
 });
});
