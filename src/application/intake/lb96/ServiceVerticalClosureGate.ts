import { evaluateServicePhysicalBaseline } from "./ServicePhysicalBaseline";

export interface ServiceVerticalClosureStatus {
  block: "LB96";
  objective: "VERTICAL_SERVICE_PHYSICAL_OPERATIONAL";
  engineeringClosed: boolean;
  physicalPackageOperational: boolean;
  memoryAndPptLayerReady: boolean;
  pcapLayerReady: boolean;
  pcapProvenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE" | "MISSING";
  officialPcapClaimed: false;
  blockers: readonly string[];
  nextRequiredEvidence: readonly string[];
  productionReady: false;
  humanValidationRequired: true;
}

/**
 * Gate de cierre LB96. Acepta un PCAP Service general DERIVADO únicamente si
 * existe físicamente en el inventario acreditado y la evidencia estructural
 * Service está cubierta. Nunca lo transforma en modelo oficial: la procedencia
 * permanece visible y la aceptación humana continúa siendo obligatoria.
 */
export function evaluateServiceVerticalClosure(input: {
  memoryAvailable: boolean;
  pptAvailable: boolean;
  pcapDerivedAvailable?: boolean;
}): ServiceVerticalClosureStatus {
  const baseline = evaluateServicePhysicalBaseline();
  const memoryAndPptLayerReady = input.memoryAvailable && input.pptAvailable;
  const pcapLayerReady = Boolean(input.pcapDerivedAvailable && baseline.pcap.structuralEvidenceReady);
  const blockers: string[] = [];

  if (!input.memoryAvailable) blockers.push("Falta la Memoria general Service físicamente recuperable y verificada.");
  if (!input.pptAvailable) blockers.push("Falta el PPT general Service físicamente recuperable y verificado.");
  if (!pcapLayerReady) blockers.push("Falta un PCAP Service editable derivado, source-backed, físicamente verificado y persistido.");

  const physicalPackageOperational = memoryAndPptLayerReady && pcapLayerReady && blockers.length === 0;
  return {
    block: "LB96",
    objective: "VERTICAL_SERVICE_PHYSICAL_OPERATIONAL",
    engineeringClosed: physicalPackageOperational,
    physicalPackageOperational,
    memoryAndPptLayerReady,
    pcapLayerReady,
    pcapProvenance: pcapLayerReady ? "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE" : "MISSING",
    officialPcapClaimed: false,
    blockers,
    nextRequiredEvidence: pcapLayerReady ? [] : [
      "PCAP Service derivado de Contrata-IA con fuente 2026 acreditada.",
      "SHA-256 y huella de estilo reproducibles.",
      "Persistencia durable y recuperación por inventario Service independiente.",
      "Declaración officialModel=false y validación humana obligatoria.",
    ],
    productionReady: false,
    humanValidationRequired: true,
  };
}
