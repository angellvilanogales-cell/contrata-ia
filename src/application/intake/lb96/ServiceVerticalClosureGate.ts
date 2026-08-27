import { evaluateServicePhysicalBaseline } from "./ServicePhysicalBaseline";

export interface ServiceVerticalClosureStatus {
  block: "LB96";
  objective: "VERTICAL_SERVICE_PHYSICAL_OPERATIONAL";
  engineeringClosed: boolean;
  physicalPackageOperational: boolean;
  memoryAndPptLayerReady: boolean;
  pcapLayerReady: boolean;
  blockers: readonly string[];
  nextRequiredEvidence: readonly string[];
  productionReady: false;
  humanValidationRequired: true;
}

/**
 * Gate de cierre LB96. Un vertical Service no se declara físicamente operativo
 * solo porque existan motores/preguntas o Memoria/PPT derivadas. El roadmap
 * exige un paquete compatible Memoria + PCAP + PPT. Mientras el PCAP Service
 * editable permanezca en aislamiento pendiente, engineeringClosed debe seguir
 * siendo false y la UI debe mostrar el bloqueo en vez de sustituirlo por una
 * plantilla de otra familia o por un PDF de caso.
 */
export function evaluateServiceVerticalClosure(input: {
  memoryAvailable: boolean;
  pptAvailable: boolean;
  pcapEditablePromoted?: boolean;
}): ServiceVerticalClosureStatus {
  const baseline = evaluateServicePhysicalBaseline();
  const memoryAndPptLayerReady = input.memoryAvailable && input.pptAvailable;
  const pcapLayerReady = Boolean(input.pcapEditablePromoted && baseline.pcap.structuralEvidenceReady);
  const blockers: string[] = [];

  if (!input.memoryAvailable) blockers.push("Falta la Memoria general Service físicamente recuperable y verificada.");
  if (!input.pptAvailable) blockers.push("Falta el PPT general Service físicamente recuperable y verificado.");
  if (!pcapLayerReady) blockers.push("Falta aislar, verificar y promover un PCAP Service editable compatible; un PDF de caso o un fragmento incrustado no habilitan generación física.");

  const physicalPackageOperational = memoryAndPptLayerReady && pcapLayerReady && blockers.length === 0;
  return {
    block: "LB96",
    objective: "VERTICAL_SERVICE_PHYSICAL_OPERATIONAL",
    engineeringClosed: physicalPackageOperational,
    physicalPackageOperational,
    memoryAndPptLayerReady,
    pcapLayerReady,
    blockers,
    nextRequiredEvidence: pcapLayerReady ? [] : [
      "Binario ODT/DOCX Service original o aislamiento binario verificable del modelo Service.",
      "SHA-256 y huella de estilo reproducibles.",
      "Ámbito exacto de procedimiento, financiación, versión y presentación electrónica.",
      "Promoción explícita como activo Service sin contaminarlo con Supply ni con datos de expediente real.",
    ],
    productionReady: false,
    humanValidationRequired: true,
  };
}
