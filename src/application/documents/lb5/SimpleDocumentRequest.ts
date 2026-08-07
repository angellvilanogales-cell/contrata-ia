import type { CustomDocumentRequest, DocumentBlockId } from "./DocumentModel";

const TOPIC_MAP: readonly { readonly tokens: readonly string[]; readonly blocks: readonly DocumentBlockId[] }[] = [
  { tokens: ["necesidad", "idoneidad"], blocks: ["NEED_IDONEITY", "OBJECT_CPV"] },
  { tokens: ["insuficiencia", "medios"], blocks: ["INSUFFICIENCY_MEANS"] },
  { tokens: ["lote", "lotes", "division", "división", "no division", "no división"], blocks: ["LOTS"] },
  { tokens: ["procedimiento", "tramitacion", "tramitación"], blocks: ["PROCEDURE"] },
  { tokens: ["solvencia"], blocks: ["SOLVENCY"] },
  { tokens: ["criterio", "criterios", "adjudicacion", "adjudicación"], blocks: ["AWARD_CRITERIA"] },
  { tokens: ["garantia", "garantía", "garantias", "garantías"], blocks: ["GUARANTEES"] },
  { tokens: ["ejecucion", "ejecución", "ambiental", "social"], blocks: ["SPECIAL_EXECUTION"] },
  { tokens: ["subrogacion", "subrogación", "personal"], blocks: ["SUBROGATION"] },
  { tokens: ["datos", "proteccion", "protección", "rgpd"], blocks: ["DATA_PROTECTION"] },
  { tokens: ["presupuesto", "valor estimado", "coste", "costes"], blocks: ["BUDGET_VALUE"] },
  { tokens: ["tecnico", "técnico", "tecnica", "técnica", "prestaciones"], blocks: ["TECHNICAL_SCOPE", "TECHNICAL_EXECUTION", "QUALITY_CONTROL"] }
];

function normalize(value: string): string {
  return value.toLocaleLowerCase("es-ES").trim();
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export class SimpleDocumentRequestInterpreter {
  public interpret(instruction: string): CustomDocumentRequest {
    const normalized = normalize(instruction);
    if (!normalized) throw new Error("La indicación para el documento adicional está vacía.");

    const blocks: DocumentBlockId[] = ["IDENTIFICATION"];
    for (const entry of TOPIC_MAP) {
      if (entry.tokens.some(token => normalized.includes(token))) blocks.push(...entry.blocks);
    }

    if (blocks.length === 1) {
      throw new Error("No se ha identificado ningún bloque jurídico-documental verificable. Especifique, por ejemplo, necesidad, lotes, procedimiento, solvencia, criterios, garantías, subrogación o prestaciones técnicas.");
    }
    blocks.push("LEGAL_TRACEABILITY");

    const requestedTitle = normalized.includes("informe")
      ? instruction.replace(/^\s*(genera|generar|necesito|crear|redacta|redactar)\s+/i, "").trim()
      : `Informe solicitado: ${instruction.trim()}`;

    return {
      title: requestedTitle,
      blockIds: unique(blocks),
      introductoryText: `Documento adicional generado a solicitud de la persona tramitadora: ${instruction.trim()}. Su contenido reutiliza los mismos datos, reglas y fuentes del expediente para evitar contradicciones.`
    };
  }
}
