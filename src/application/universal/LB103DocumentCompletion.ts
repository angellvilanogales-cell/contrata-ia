import type { UniversalEvidenceRecord } from "../intake/lb52/UniversalEvidenceWorkspace";
import { evaluateSupplyUserJourney } from "../intake/lb95/SupplyUserJourneyCoordinator";
import { supplyAsaPcapRequiredFieldPaths } from "../intake/lb95/SupplyAsaGeneralPcapRenderer";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST } from "../intake/lb51/UniversalV1UiFieldManifest";
import { SUPPLY_VERTICAL_FIELD_MANIFEST } from "../intake/lb93/SupplyVerticalFieldManifest";
import { SUPPLY_ASA_PCAP_FIELD_MANIFEST } from "../intake/lb95/SupplyAsaPcapFieldManifest";

export const LB103_DOCUMENT_FIELDS = [
  {
    fieldPath: "economic.priceRevisionRegime",
    label: "Revisión de precios",
    control: "SELECT" as const,
    options: ["No procede"] as const,
    help: "La plantilla física Supply ASA V1 solo está acreditada para expedientes sin revisión de precios.",
  },
  ...SUPPLY_VERTICAL_FIELD_MANIFEST, ...SUPPLY_ASA_PCAP_FIELD_MANIFEST, ...UNIVERSAL_V1_UI_FIELD_MANIFEST,
  { fieldPath: "lots.lots", label: "Relación y descripción de lotes", control: "TABLE" as const },
].filter((item, index, all) => all.findIndex(other => other.fieldPath === item.fieldPath) === index);

/** Completion is distinct from compatible template selection. No missing decision is inferred. */
export function evaluateLB103DocumentCompletion(record: UniversalEvidenceRecord) {
  const journey = evaluateSupplyUserJourney(record);
  const divided = record.fields["lots.divisionIntoLots"]?.value === true;
  const paths = [...new Set([
    ...journey.stages.filter(stage => stage.id !== "DOCUMENTS" && stage.id !== "FINAL_REVIEW").flatMap(stage => stage.applicablePaths),
    ...supplyAsaPcapRequiredFieldPaths(),
    "administrative.pcapAnnexIResidualDecisions",
  ])].filter(path => path !== "lots.noDivisionJustification" || !divided);
  const fields = paths.map(fieldPath => {
    const definition = LB103_DOCUMENT_FIELDS.find(item => item.fieldPath === fieldPath);
    const field = record.fields[fieldPath];
    const ready = field?.status === "HUMAN_VALIDATED" && field.humanValidated === true &&
      Boolean(field.humanValidation?.by && field.humanValidation.at) && field.value !== undefined && field.value !== null &&
      (typeof field.value !== "string" || Boolean(field.value.trim())) && (!Array.isArray(field.value) || field.value.length > 0);
    return { fieldPath, label: definition?.label ?? fieldPath, control: definition?.control ?? "TEXTAREA",
      options: definition && "options" in definition ? definition.options : undefined,
      help: definition && "help" in definition ? definition.help : undefined,
      rows: definition && "rows" in definition ? definition.rows : undefined,
      value: field?.value, status: field?.status ?? "PENDING", ready };
  });
  const blockers = fields.filter(field => !field.ready).map(field => `${field.label}: pendiente de completar o validar.`);
  return { ready: blockers.length === 0, fields, blockers };
}
