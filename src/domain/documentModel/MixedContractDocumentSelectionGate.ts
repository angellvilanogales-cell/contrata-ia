import { DocumentType } from "./DocumentType";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { assessUniversalDocumentLibrary } from "./UniversalDocumentLibraryReadiness";

export interface MixedContractDocumentSelectionInput {
  principalContractType?: Exclude<UniversalTargetContractType, "MIXED">;
  procedure: TipoProcedimiento;
  mixedSpecificClausesRequired: boolean | "UNKNOWN";
}

export interface MixedContractDocumentSelectionResult {
  ready: boolean;
  baseFamily?: Exclude<UniversalTargetContractType, "MIXED">;
  blockers: readonly string[];
  humanValidationRequired: true;
}

/**
 * Un contrato mixto no hereda ciegamente el pliego de la prestación principal.
 * Solo puede tomarla como familia base si está determinada y la biblioteca física
 * de esa familia es completa; las cláusulas mixtas requieren además validación.
 */
export function assessMixedContractDocumentSelection(input: MixedContractDocumentSelectionInput): MixedContractDocumentSelectionResult {
  const blockers: string[] = [];
  if (!input.principalContractType) {
    blockers.push("No consta validada la prestación principal del contrato mixto.");
    return { ready: false, blockers, humanValidationRequired: true };
  }
  if (input.principalContractType === "CONCESSION") {
    blockers.push("El componente concesional exige tratamiento documental específico; no se reutiliza automáticamente un modelo ordinario.");
  }
  const library = assessUniversalDocumentLibrary(input.principalContractType, input.procedure);
  blockers.push(...library.blockers);
  if (input.mixedSpecificClausesRequired === "UNKNOWN") blockers.push("Falta determinar si el objeto mixto exige cláusulas específicas adicionales en PCAP/PPT/Memoria.");
  if (input.mixedSpecificClausesRequired === true) blockers.push("Las cláusulas específicas del contrato mixto deben validarse antes de generar el paquete físico.");
  return {
    ready: blockers.length === 0,
    baseFamily: input.principalContractType,
    blockers,
    humanValidationRequired: true,
  };
}
