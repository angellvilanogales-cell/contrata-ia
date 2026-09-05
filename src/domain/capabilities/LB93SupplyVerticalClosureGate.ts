export interface LB93SupplyVerticalClosureInput {
  canonicalEvidenceWorkspaceExtended: boolean;
  durablePersistenceVerified: boolean;
  guidedSupplyFieldsExposed: boolean;
  supplyProgressVisible: boolean;
  legalBoundaryChecksCovered: boolean;
  supplyVariantIsolationCovered: boolean;
  physicalDocumentGatePreserved: boolean;
  humanValidationPreserved: boolean;
  fullCiGreen: boolean;
}

export interface LB93SupplyVerticalClosureResult {
  engineeringClosed: boolean;
  pilotWorkflowViable: boolean;
  fullPhysicalPackageReady: false;
  productionReady: false;
  blockers: readonly string[];
  humanAcceptanceRequired: true;
}

/**
 * LB93 separa deliberadamente tres hitos:
 * 1) vertical Supply utilizable para captura/revisión;
 * 2) paquete físico universal completo;
 * 3) producción institucional.
 *
 * LB93 puede cerrar (1) sin falsear (2) ni (3). Memoria/PPT universales siguen
 * requiriendo activos editables generales acreditados.
 */
export function evaluateLB93SupplyVerticalClosure(input: LB93SupplyVerticalClosureInput): LB93SupplyVerticalClosureResult {
  const blockers: string[] = [];
  if (!input.canonicalEvidenceWorkspaceExtended) blockers.push("Los campos Supply no están integrados en el workspace universal canónico.");
  if (!input.durablePersistenceVerified) blockers.push("La persistencia durable del expediente no está verificada.");
  if (!input.guidedSupplyFieldsExposed) blockers.push("La interfaz no expone todos los campos esenciales del vertical Supply.");
  if (!input.supplyProgressVisible) blockers.push("La interfaz no muestra progreso/bloqueos del vertical Supply.");
  if (!input.legalBoundaryChecksCovered) blockers.push("Faltan regresiones de límites jurídicos esenciales del procedimiento/lotes.");
  if (!input.supplyVariantIsolationCovered) blockers.push("No está acreditado el aislamiento de subfamilias técnicas Supply.");
  if (!input.physicalDocumentGatePreserved) blockers.push("El gate físico documental ha sido debilitado.");
  if (!input.humanValidationPreserved) blockers.push("La aceptación/validación humana no está preservada.");
  if (!input.fullCiGreen) blockers.push("La CI completa no está verde.");

  const engineeringClosed = blockers.length === 0;
  return {
    engineeringClosed,
    pilotWorkflowViable: engineeringClosed,
    fullPhysicalPackageReady: false,
    productionReady: false,
    blockers,
    humanAcceptanceRequired: true,
  };
}
