import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { supplyAsaPcapRequiredFieldPaths } from "./SupplyAsaGeneralPcapRenderer";
import type { SupplyUserJourney } from "./SupplyUserJourneyCoordinator";

export interface SupplyPcapParametrizationGate {
  ready: boolean;
  templateId: "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17";
  blockers: readonly string[];
  requiredFieldPaths: readonly string[];
  humanValidationRequired: true;
  officialScopeRespected: boolean;
}

const TEMPLATE_ID = "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17" as const;

function value(record: UniversalEvidenceRecord, path: string): unknown {
  return record.fields[path]?.value;
}

function validateRequiredMapping(record: UniversalEvidenceRecord, blockers: string[]): readonly string[] {
  const paths = supplyAsaPcapRequiredFieldPaths();
  for (const path of paths) {
    const field = record.fields[path];
    if (!field) { blockers.push(`PCAP: falta ${path}.`); continue; }
    if (field.status === "SOURCE_CONFLICT" || field.status === "PENDING" || field.status === "SYSTEM_PROPOSAL") { blockers.push(`PCAP: ${path} está ${field.status}.`); continue; }
    if (field.status === "NOT_APPLICABLE") { blockers.push(`PCAP: ${path} es obligatorio en el modelo ASA y no admite NOT_APPLICABLE.`); continue; }
    if (field.status !== "HUMAN_VALIDATED" || field.humanValidated !== true) blockers.push(`PCAP: ${path} requiere validación humana expresa.`);
  }
  return paths;
}

/**
 * Protege el ámbito del modelo oficial. No transforma ni completa datos:
 * únicamente decide si el expediente puede entrar en la fase de mapping PCAP.
 */
export function evaluateSupplyPcapParametrizationGate(
  record: UniversalEvidenceRecord,
  journey: SupplyUserJourney,
  officialTemplateAvailable: boolean,
): SupplyPcapParametrizationGate {
  const blockers: string[] = [];
  if (value(record, "contractType") !== "SUPPLY") blockers.push("El modelo PCAP seleccionado solo corresponde a contratos de suministro.");
  if (value(record, "procedure") !== "ABIERTO_SIMPLIFICADO_ABREVIADO") blockers.push("El modelo oficial acreditado corresponde exclusivamente al abierto simplificado abreviado.");
  const funding = String(value(record, "economic.fundingSource") ?? "");
  if (!(["AUTOFINANCED", "AUTOFINANCIADA"] as string[]).includes(funding)) blockers.push("El modelo oficial acreditado exige perfil de financiación autofinanciada.");
  if (!journey.readyForFinalReview) blockers.push("El expediente todavía no ha completado todos los datos aplicables.");
  const finalReview = journey.stages.find(stage => stage.id === "FINAL_REVIEW");
  if (finalReview?.status !== "COMPLETE") blockers.push("La revisión y validación humana final no está completada.");
  const requiredFieldPaths = validateRequiredMapping(record, blockers);
  if (!officialTemplateAvailable) blockers.push("El binario oficial PCAP acreditado no está disponible en runtime.");
  const scopeBlockers = blockers.filter(item => item.includes("modelo oficial acreditado") || item.includes("solo corresponde"));
  return {
    ready: blockers.length === 0,
    templateId: TEMPLATE_ID,
    blockers: [...new Set(blockers)],
    requiredFieldPaths,
    humanValidationRequired: true,
    officialScopeRespected: scopeBlockers.length === 0,
  };
}
