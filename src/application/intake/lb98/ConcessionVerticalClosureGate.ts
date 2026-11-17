import type { ConcessionRiskOperationalResult } from "./ConcessionRiskOperationalGate";
import type { ConcessionViabilityContentResult } from "./ConcessionViabilityContentGate";

export interface ConcessionVerticalClosureStatus {
  block: "LB98";
  objective: "VERTICAL_CONCESSION_PHYSICAL_OPERATIONAL";
  engineeringClosed: boolean;
  physicalPackageOperational: boolean;
  realCaseEvidenceReady: boolean;
  operationalRiskReady: boolean;
  viabilityContentReady: boolean;
  preparationReady: boolean;
  documentaryLayerReady: boolean;
  packageGeneratorReady: boolean;
  e2eReady: boolean;
  blockers: readonly string[];
  productionReady: false;
  humanValidationRequired: true;
}

export function evaluateConcessionVerticalClosure(input: {
  realCaseEvidenceReady: boolean;
  risk: ConcessionRiskOperationalResult;
  viabilityContent: ConcessionViabilityContentResult;
  pcapAvailable: boolean;
  memoryAvailable: boolean;
  pptAvailable: boolean;
  viabilityTemplateAvailable: boolean;
  preparationReady?: boolean;
  preparationBlockers?: readonly string[];
  packageGeneratorReady?: boolean;
  e2eReady?: boolean;
}): ConcessionVerticalClosureStatus {
  const blockers: string[] = [];
  const operationalRiskReady = input.risk.concessionQualificationSupported;
  const viabilityContentReady = input.viabilityContent.complete;
  const preparationReady = input.preparationReady !== false;
  const documentaryLayerReady = input.pcapAvailable && input.memoryAvailable && input.pptAvailable && input.viabilityTemplateAvailable;
  const packageGeneratorReady = input.packageGeneratorReady === true;
  const e2eReady = input.e2eReady === true;
  if (!input.realCaseEvidenceReady) blockers.push("Falta autoridad concesional real acreditada para el subtipo tramitado.");
  blockers.push(...input.risk.blockers, ...input.viabilityContent.blockers);
  if (!preparationReady) blockers.push(...(input.preparationBlockers?.length ? input.preparationBlockers : ["La preparación específica del subtipo concesional no está cerrada."]));
  if (!input.pcapAvailable) blockers.push("Falta PCAP Concession editable físicamente recuperable y verificado.");
  if (!input.memoryAvailable) blockers.push("Falta Memoria Concession editable físicamente recuperable y verificada.");
  if (!input.pptAvailable) blockers.push("Falta PPT Concession editable físicamente recuperable y verificado.");
  if (!input.viabilityTemplateAvailable) blockers.push("Falta estudio de viabilidad Concession editable físicamente recuperable y verificado.");
  if (!packageGeneratorReady) blockers.push("Falta acreditar renderer, ZIP y auditoría cruzada del paquete Concession.");
  if (!e2eReady) blockers.push("Falta E2E positivo del subtipo concesional con riesgo operacional y viabilidad acreditados.");
  const physicalPackageOperational = input.realCaseEvidenceReady && operationalRiskReady && viabilityContentReady && preparationReady && documentaryLayerReady && packageGeneratorReady && e2eReady && blockers.length === 0;
  return {
    block: "LB98",
    objective: "VERTICAL_CONCESSION_PHYSICAL_OPERATIONAL",
    engineeringClosed: physicalPackageOperational,
    physicalPackageOperational,
    realCaseEvidenceReady: input.realCaseEvidenceReady,
    operationalRiskReady,
    viabilityContentReady,
    preparationReady,
    documentaryLayerReady,
    packageGeneratorReady,
    e2eReady,
    blockers: [...new Set(blockers)],
    productionReady: false,
    humanValidationRequired: true,
  };
}
