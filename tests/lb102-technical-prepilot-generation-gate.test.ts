import {describe,expect,it} from "vitest";
import {evaluateLB102TechnicalPrePilot} from "../src/application/operations/lb102/LB102TechnicalPrePilotStatus";

const base={
 lb101SecurityReady:true,
 negativeRegressionConflictPassed:true,
 negativeRegressionMissingValidationPassed:true,
 negativeRegressionTemplateIntegrityPassed:true,
} as const;

describe("LB102.82 - preflight técnico ligado a generación desplegada",()=>{
 it("bloquea el pre-piloto si algún paquete no puede generarse con los activos persistidos",()=>{
  const status=evaluateLB102TechnicalPrePilot({...base,deployedGenerationReady:false});
  expect(status.technicalPrePilotReady).toBe(false);
  expect(status.appViableForPilot).toBe(false);
  expect(status.blockers.join(" ")).toMatch(/cuatro paquetes.*activos persistidos/i);
 });

 it("permite cerrar la parte técnica cuando seguridad, corpus, regresiones y generación están listas",()=>{
  const status=evaluateLB102TechnicalPrePilot({...base,deployedGenerationReady:true});
  expect(status.technicalPrePilotReady).toBe(true);
  expect(status.appViableForPilot).toBe(false);
  expect(status.blockers.join(" ")).toMatch(/sesiones de aceptación funcional/i);
 });
});
