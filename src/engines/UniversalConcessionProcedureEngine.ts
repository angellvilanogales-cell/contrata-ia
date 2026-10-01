export type UniversalConcessionProcedure =
  | "OPEN"
  | "RESTRICTED"
  | "TENDER_WITH_NEGOTIATION"
  | "NEGOTIATED_WITHOUT_PUBLICITY"
  | "COMPETITIVE_DIALOGUE"
  | "INNOVATION_PARTNERSHIP";

export interface UniversalConcessionProcedureInput {
  selectedProcedure: UniversalConcessionProcedure;
  serviceConcessionAnnexIVSpecialService?: boolean;
  exceptionalProcedureLegalGroundDocumented?: boolean;
  exceptionalProcedureLegalGroundReference?: string;
}

export interface UniversalConcessionProcedureDecision {
  valid: boolean;
  procedure: UniversalConcessionProcedure;
  blockers: readonly string[];
  warnings: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

const EXCEPTIONAL = new Set<UniversalConcessionProcedure>([
  "TENDER_WITH_NEGOTIATION",
  "NEGOTIATED_WITHOUT_PUBLICITY",
  "COMPETITIVE_DIALOGUE",
  "INNOVATION_PARTNERSHIP",
]);

/**
 * Valida el procedimiento concesional ya seleccionado por el expediente.
 * No selecciona automáticamente un supuesto excepcional y excluye las variantes
 * simplificadas del art. 159, que no son procedimientos concesionales.
 */
export class UniversalConcessionProcedureEngine {
  public evaluate(input: UniversalConcessionProcedureInput): UniversalConcessionProcedureDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (input.serviceConcessionAnnexIVSpecialService === true && input.selectedProcedure !== "RESTRICTED") {
      blockers.push("Las concesiones de servicios especiales del Anexo IV deben tramitarse por procedimiento restringido.");
    }

    if (EXCEPTIONAL.has(input.selectedProcedure)) {
      if (input.exceptionalProcedureLegalGroundDocumented !== true) {
        blockers.push(`El procedimiento ${input.selectedProcedure} requiere acreditar el supuesto legal específico; no puede proponerse por conveniencia o cuantía.`);
      }
      if (!input.exceptionalProcedureLegalGroundReference?.trim()) {
        blockers.push(`Falta la referencia jurídica/factual que habilita ${input.selectedProcedure}.`);
      }
    }

    if (input.selectedProcedure === "OPEN" || input.selectedProcedure === "RESTRICTED") {
      warnings.push("La elección entre abierto y restringido corresponde al órgano de contratación, sin perjuicio de los supuestos en que la LCSP impone el restringido.");
    }

    return {
      valid: blockers.length === 0,
      procedure: input.selectedProcedure,
      blockers,
      warnings,
      legalBasis: [
        "art. 131.2 LCSP",
        input.selectedProcedure === "OPEN" ? "arts. 156-158 LCSP" : "arts. 160-165 LCSP",
        ...(EXCEPTIONAL.has(input.selectedProcedure) ? ["arts. 167-177 LCSP, según procedimiento y supuesto habilitante"] : []),
        "art. 159 LCSP: simplificado no aplicable a concesiones",
      ],
      humanValidationRequired: true,
    };
  }
}
