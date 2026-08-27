import type { WorksPreparationGateResult } from "./WorksPreparationGate";

export interface WorksVerticalClosureStatus {
  block: "LB97";
  objective: "VERTICAL_WORKS_PHYSICAL_OPERATIONAL";
  engineeringClosed: boolean;
  physicalPackageOperational: boolean;
  documentaryLayerReady: boolean;
  preparationLayerReady: boolean;
  packageGeneratorReady: boolean;
  blockers: readonly string[];
  productionReady: false;
  humanValidationRequired: true;
}

export function evaluateWorksVerticalClosure(input: {
  pcapAvailable: boolean;
  memoryAvailable: boolean;
  pptAvailable: boolean;
  preparation: WorksPreparationGateResult;
  packageGeneratorReady?: boolean;
}): WorksVerticalClosureStatus {
  const blockers: string[] = [];
  const documentaryLayerReady = input.pcapAvailable && input.memoryAvailable && input.pptAvailable;
  const preparationLayerReady = input.preparation.readyForTenderPreparation;
  const packageGeneratorReady = input.packageGeneratorReady === true;

  if (!input.pcapAvailable) blockers.push("Falta PCAP Works editable físicamente recuperable y verificado.");
  if (!input.memoryAvailable) blockers.push("Falta Memoria Works editable físicamente recuperable y verificada.");
  if (!input.pptAvailable) blockers.push("Falta PPT/marco técnico Works editable físicamente recuperable y verificado.");
  blockers.push(...input.preparation.blockers);
  if (!packageGeneratorReady) blockers.push("Falta acreditar renderer, ZIP y auditoría cruzada del paquete Works.");

  const physicalPackageOperational = documentaryLayerReady && preparationLayerReady && packageGeneratorReady && blockers.length === 0;
  return {
    block: "LB97",
    objective: "VERTICAL_WORKS_PHYSICAL_OPERATIONAL",
    engineeringClosed: physicalPackageOperational,
    physicalPackageOperational,
    documentaryLayerReady,
    preparationLayerReady,
    packageGeneratorReady,
    blockers,
    productionReady: false,
    humanValidationRequired: true,
  };
}
