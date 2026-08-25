import { CanonicalContractType } from "../../../expediente/CanonicalExpedienteState";
import { EvidenceField, EvidenceReference } from "../../../expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../expediente/UniversalExpedienteV13";

export interface HarmonizedThresholdRule {
  id: string;
  contractKinds: readonly CanonicalContractType[];
  thresholdCents: number;
  sourceId: string;
  locator?: string;
  legalBasis: readonly string[];
  scopeConfirmed: boolean;
  scopeDescription: string;
}

export interface HarmonizedResolutionResult {
  expediente: UniversalExpedienteV13;
  proposed: boolean;
  blockers: readonly string[];
}

function ruleReference(rule: HarmonizedThresholdRule): EvidenceReference {
  return {
    kind: "NORMATIVE_RULE",
    sourceId: rule.sourceId,
    locator: rule.locator,
    note: `Regla ${rule.id}: ${rule.scopeDescription}`,
  };
}

function proposal<T>(
  key: string,
  value: T,
  source: EvidenceReference,
  legalBasis: readonly string[],
  diagnostics: readonly string[],
): EvidenceField<T> {
  return {
    key,
    value,
    status: "SYSTEM_PROPOSAL",
    sources: [source],
    legalBasis,
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics,
  };
}

function isHumanValidated(field: EvidenceField<unknown>): boolean {
  return field.status === "HUMAN_VALIDATED" && field.humanValidated && field.value !== null;
}

/**
 * Bloque 15.10.
 *
 * Resuelve una propuesta de sujeción a regulación armonizada exclusivamente a
 * partir de una regla normativa aportada de forma explícita. No contiene
 * umbrales legales codificados y no presume que VE + tipo contractual sean por
 * sí solos suficientes: la regla debe declarar confirmado su ámbito jurídico
 * (órgano/categoría/exclusiones y demás extremos que correspondan).
 */
export class UniversalHarmonizedRegulationResolver {
  public resolve(
    expediente: UniversalExpedienteV13,
    rule: HarmonizedThresholdRule,
  ): HarmonizedResolutionResult {
    const blockers: string[] = [];
    const contractType = expediente.canonical.fields.contractType;
    const canonicalVe = expediente.canonical.fields.estimatedValueCents;
    const legalVe = expediente.economic.legalEstimatedValueCents;
    const currentSara = expediente.regulation.harmonizedRegulation;
    const currentThreshold = expediente.regulation.threshold;

    if (!rule.id.trim()) blockers.push("La regla SARA debe tener identificador.");
    if (!rule.sourceId.trim()) blockers.push("La regla SARA debe identificar su fuente normativa.");
    if (rule.legalBasis.length === 0) blockers.push("La regla SARA debe contener fundamento jurídico.");
    if (!Number.isInteger(rule.thresholdCents) || rule.thresholdCents <= 0) blockers.push("El umbral SARA debe expresarse como céntimos enteros positivos.");
    if (!rule.scopeConfirmed) blockers.push("El ámbito jurídico de la regla SARA no está confirmado; no basta comparar el VE con un umbral.");
    if (!rule.scopeDescription.trim()) blockers.push("La regla SARA debe describir el ámbito jurídico que ha sido contrastado.");

    if (contractType.status === "SOURCE_CONFLICT") blockers.push("Existe conflicto de fuente sobre la naturaleza contractual.");
    if (!isHumanValidated(contractType)) blockers.push("La naturaleza contractual debe estar validada humanamente antes de resolver SARA.");
    if (contractType.value && !rule.contractKinds.includes(contractType.value)) blockers.push(`La regla ${rule.id} no cubre el tipo contractual ${contractType.value}.`);

    if (canonicalVe.status === "SOURCE_CONFLICT" || legalVe.status === "SOURCE_CONFLICT") blockers.push("Existe conflicto de fuente sobre el valor estimado.");
    if (!isHumanValidated(canonicalVe) || !isHumanValidated(legalVe)) blockers.push("El VE debe estar validado humanamente en sus vistas canónica y económica antes de resolver SARA.");
    if (canonicalVe.value !== legalVe.value) blockers.push(`El VE canónico (${String(canonicalVe.value)}) y el VE económico (${String(legalVe.value)}) divergen; no se selecciona uno automáticamente.`);

    if (currentSara.status === "SOURCE_CONFLICT") blockers.push("La sujeción SARA mantiene un conflicto de fuente que no puede sustituirse por una regla automática.");
    if (currentSara.status !== "PENDING") blockers.push("La sujeción SARA ya contiene evidencia y el Bloque 15.10 no la sobrescribe.");
    if (currentThreshold.status === "SOURCE_CONFLICT") blockers.push("El umbral jurídico mantiene un conflicto de fuente que no puede sustituirse automáticamente.");
    if (currentThreshold.status !== "PENDING") blockers.push("El umbral jurídico ya contiene evidencia y el Bloque 15.10 no la sobrescribe.");

    if (blockers.length > 0 || canonicalVe.value === null) {
      return { expediente, proposed: false, blockers };
    }

    const source = ruleReference(rule);
    const sara = canonicalVe.value >= rule.thresholdCents;
    const thresholdEuros = rule.thresholdCents / 100;
    const thresholdField = proposal(
      "regulation.threshold",
      thresholdEuros,
      source,
      rule.legalBasis,
      [
        `Umbral aportado por la regla ${rule.id}: ${thresholdEuros.toFixed(2)} EUR.`,
        "El umbral no está hardcodeado en el motor; procede de la fuente normativa seleccionada y requiere validación humana.",
      ],
    );
    const saraField = proposal(
      "regulation.harmonizedRegulation",
      sara,
      source,
      rule.legalBasis,
      [
        `Comparación determinista: VE ${canonicalVe.value} céntimos frente a umbral ${rule.thresholdCents} céntimos.`,
        `Ámbito jurídico confirmado para la regla: ${rule.scopeDescription}`,
        "La salida es una propuesta normativa y no se promueve sin validación humana.",
      ],
    );

    const alreadyRegistered = expediente.traceability.sourceRegistry.some(
      item => item.kind === source.kind && item.sourceId === source.sourceId && item.locator === source.locator,
    );

    return {
      expediente: {
        ...expediente,
        regulation: {
          ...expediente.regulation,
          threshold: thresholdField,
          harmonizedRegulation: saraField,
        },
        traceability: {
          ...expediente.traceability,
          sourceRegistry: alreadyRegistered
            ? expediente.traceability.sourceRegistry
            : [...expediente.traceability.sourceRegistry, source],
        },
      },
      proposed: true,
      blockers: [],
    };
  }
}
