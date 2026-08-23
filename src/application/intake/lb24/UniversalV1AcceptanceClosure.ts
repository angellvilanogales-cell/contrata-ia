import { RealCaseAcceptanceResult } from "./UniversalRealCaseAcceptance";

export interface UniversalV1AcceptanceClosureResult {
  engineeringReady: boolean;
  productionReady: boolean;
  blockers: readonly string[];
}

/**
 * LB24.5. Cierre de aceptación previa a V1. Separa la terminación de la
 * ingeniería de aceptación del alta productiva real. La producción solo puede
 * cerrarse con al menos un expediente real superado extremo a extremo.
 */
export function evaluateUniversalV1AcceptanceClosure(
  realCases: readonly RealCaseAcceptanceResult[],
): UniversalV1AcceptanceClosureResult {
  const blockers: string[] = [];
  if (realCases.length === 0) blockers.push("No existe ningún caso real registrado para aceptación V1.");

  const engineeringReady = realCases.length > 0 && realCases.every(result => result.engineeringReady);
  if (!engineeringReady && realCases.length > 0) blockers.push("La ingeniería de aceptación end-to-end mantiene casos incompletos.");

  const accepted = realCases.filter(result => result.productionAccepted);
  if (accepted.length === 0) blockers.push("Ningún expediente real ha completado todavía generación, auditoría documental, recarga y revisión humana con modelo oficial editable.");

  return {
    engineeringReady,
    productionReady: engineeringReady && accepted.length === realCases.length && blockers.length === 0,
    blockers,
  };
}
