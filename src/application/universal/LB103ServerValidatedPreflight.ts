import { createHash } from "node:crypto";
import type { AdaptiveStoredCase } from "../../infrastructure/operations/lb7/AdaptiveCaseStore";
import type { EvidenceField } from "../../domain/expediente/EvidenceField";
import { isPromotableEvidenceField } from "../../domain/expediente/EvidenceField";
import { DocumentType } from "../../domain/documentModel/DocumentType";
import { selectUniversalDocumentSource } from "../../domain/documentModel/UniversalDocumentSourceSelector";
import type { FinancingProfile } from "../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import { TipoProcedimiento } from "../../domain/procedimiento/TipoProcedimiento";
import type { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";
import { UNIVERSAL_GUIDED_UI_MANIFEST, type UniversalGuidedUiDecision } from "../../interfaces/lb103/UniversalGuidedUiManifest";

export interface LB103ValidatedEvidenceSnapshotRow {
  decisionId: string;
  evidenceFieldPath: string;
  value: unknown;
  validatedBy: string;
  validatedAt: string;
  sourceIds: readonly string[];
  legalBasisSourceIds: readonly string[];
}

export interface LB103ServerValidatedSnapshot {
  schemaVersion: "LB103-SERVER-1";
  caseId: string;
  contractType: "SUPPLY" | "SERVICE";
  procedure: TipoProcedimiento;
  financing: FinancingProfile;
  decisions: readonly LB103ValidatedEvidenceSnapshotRow[];
  sha256: string;
  humanValidated: true;
}

export interface LB103DocumentPreflightRow {
  documentType: DocumentType;
  status: "GENERAL_EDITABLE_SELECTED" | "BLOCKED";
  selectedSourceId?: string;
  blockers: readonly string[];
}

export interface LB103ServerValidatedPreflight {
  snapshotReady: boolean;
  snapshot?: LB103ServerValidatedSnapshot;
  packageReady: boolean;
  documents: readonly LB103DocumentPreflightRow[];
  blockers: readonly string[];
  humanAcceptanceStillRequired: true;
  productionReady: false;
}

const VALID_CONTRACT_TYPES = new Set(["SUPPLY", "SERVICE"]);
const VALID_FINANCING = new Set<FinancingProfile>(["AUTOFINANCED", "EU_FUNDS", "OTHER", "UNKNOWN"]);
const VALID_PROCEDURES = new Set<string>(Object.values(TipoProcedimiento));

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

function requireValidatedField(
  evidence: Readonly<Record<string, EvidenceField<unknown>>>,
  fieldPath: string,
): EvidenceField<unknown> {
  const field = evidence[fieldPath];
  if (!field) throw new Error(`Falta evidencia universal para ${fieldPath}.`);
  if (!isPromotableEvidenceField(field) || field.status !== "HUMAN_VALIDATED" || !field.humanValidated) {
    throw new Error(`La evidencia ${fieldPath} no está validada humanamente.`);
  }
  if (field.value === null || field.value === undefined) throw new Error(`La evidencia ${fieldPath} carece de valor.`);
  if (!field.humanValidation?.by || !field.humanValidation.at) {
    throw new Error(`La evidencia ${fieldPath} no conserva actor y fecha de validación.`);
  }
  return field;
}

function guidedState(caseValue: AdaptiveStoredCase): { contractType?: string } {
  const root = caseValue.answers as unknown as Record<string, unknown>;
  const value = root.__lb103;
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as { contractType?: string };
}

function applicable(decision: UniversalGuidedUiDecision, evidence: Readonly<Record<string, EvidenceField<unknown>>>): boolean {
  if (!decision.activation) return true;
  const activationDecision = Object.values(UNIVERSAL_GUIDED_UI_MANIFEST).flat().find(item => item.field === decision.activation!.field);
  if (!activationDecision) return false;
  const activationField = evidence[activationDecision.evidenceFieldPath];
  return Boolean(activationField && activationField.value === decision.activation.equals);
}

function row(decision: UniversalGuidedUiDecision, field: EvidenceField<unknown>): LB103ValidatedEvidenceSnapshotRow {
  return {
    decisionId: decision.id,
    evidenceFieldPath: decision.evidenceFieldPath,
    value: field.value,
    validatedBy: field.humanValidation!.by,
    validatedAt: field.humanValidation!.at,
    sourceIds: field.sources.map(source => source.sourceId),
    legalBasisSourceIds: decision.legalBasis.map(source => source.sourceId),
  };
}

export function evaluateLB103ServerValidatedPreflight(caseValue: AdaptiveStoredCase): LB103ServerValidatedPreflight {
  const evidence = caseValue.universalEvidence ?? {};
  const blockers: string[] = [];
  let snapshot: LB103ServerValidatedSnapshot | undefined;

  try {
    const contractTypeField = requireValidatedField(evidence, "contractType");
    const contractType = String(contractTypeField.value);
    if (!VALID_CONTRACT_TYPES.has(contractType)) throw new Error(`Tipo contractual LB103 no soportado: ${contractType}.`);
    const localContractType = guidedState(caseValue).contractType;
    if (localContractType && localContractType !== contractType) throw new Error("El tipo contractual validado no coincide con el estado guiado persistido.");

    const manifest = UNIVERSAL_GUIDED_UI_MANIFEST[contractType as "SUPPLY" | "SERVICE"];
    const decisions = manifest
      .filter(decision => applicable(decision, evidence))
      .map(decision => row(decision, requireValidatedField(evidence, decision.evidenceFieldPath)));

    const procedureField = requireValidatedField(evidence, "procedure");
    const procedure = String(procedureField.value);
    if (!VALID_PROCEDURES.has(procedure)) throw new Error(`Procedimiento no reconocido: ${procedure}.`);

    const financingField = requireValidatedField(evidence, "economic.fundingSource");
    const financing = String(financingField.value) as FinancingProfile;
    if (!VALID_FINANCING.has(financing)) throw new Error(`Perfil de financiación no reconocido: ${financing}.`);

    const payload = {
      schemaVersion: "LB103-SERVER-1" as const,
      caseId: caseValue.caseId,
      contractType: contractType as "SUPPLY" | "SERVICE",
      procedure: procedure as TipoProcedimiento,
      financing,
      decisions,
      humanValidated: true as const,
    };
    snapshot = Object.freeze({ ...payload, sha256: createHash("sha256").update(stable(payload)).digest("hex") });
  } catch (error) {
    blockers.push(error instanceof Error ? error.message : "No se pudo construir el snapshot validado en servidor.");
  }

  const documentTypes = [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT] as const;
  const documents: LB103DocumentPreflightRow[] = snapshot
    ? documentTypes.map(documentType => {
        const selection = selectUniversalDocumentSource({
          contractType: snapshot!.contractType as UniversalTargetContractType,
          documentType,
          procedure: snapshot!.procedure,
          financing: snapshot!.financing,
          technicalFamily: documentType === DocumentType.PCAP ? "GENERAL_ADMINISTRATIVE" : undefined,
        });
        const ready = selection.status === "GENERAL_EDITABLE_SELECTED";
        return {
          documentType,
          status: ready ? "GENERAL_EDITABLE_SELECTED" : "BLOCKED",
          selectedSourceId: selection.selected?.id,
          blockers: ready ? [] : selection.blockers,
        };
      })
    : documentTypes.map(documentType => ({ documentType, status: "BLOCKED" as const, blockers: ["Snapshot validado no disponible."] }));

  const documentBlockers = documents
    .filter(item => item.status === "BLOCKED")
    .flatMap(item => item.blockers.map(blocker => `${item.documentType}: ${blocker}`));
  blockers.push(...documentBlockers);

  return {
    snapshotReady: Boolean(snapshot),
    snapshot,
    packageReady: Boolean(snapshot) && documents.every(item => item.status === "GENERAL_EDITABLE_SELECTED"),
    documents,
    blockers,
    humanAcceptanceStillRequired: true,
    productionReady: false,
  };
}
