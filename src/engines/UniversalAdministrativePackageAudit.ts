import {
  AuditedAdministrativeDocument,
  UniversalDocumentFactSnapshot,
  auditUniversalCrossDocuments,
} from "./UniversalCrossDocumentAudit";
import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export interface PackageFactRule {
  factKey: string;
  requiredIn: readonly AuditedAdministrativeDocument[];
}

export interface UniversalAdministrativePackageAuditResult {
  ready: boolean;
  comparedFacts: readonly string[];
  blockers: readonly string[];
  missingFacts: readonly { factKey: string; document: AuditedAdministrativeDocument }[];
  humanValidationRequired: true;
}

const COMMON_RULES: readonly PackageFactRule[] = [
  { factKey: "contractType", requiredIn: ["MEMORY", "PCAP", "PPT"] },
  { factKey: "object", requiredIn: ["MEMORY", "PCAP", "PPT"] },
  { factKey: "cpvMain", requiredIn: ["MEMORY", "PCAP", "PPT"] },
  { factKey: "lots", requiredIn: ["MEMORY", "PCAP", "PPT"] },
  { factKey: "durationMonths", requiredIn: ["MEMORY", "PCAP", "PPT"] },
  { factKey: "estimatedValueCents", requiredIn: ["MEMORY", "PCAP"] },
  { factKey: "baseTenderBudgetCents", requiredIn: ["MEMORY", "PCAP"] },
  { factKey: "procedure", requiredIn: ["MEMORY", "PCAP"] },
];

const FAMILY_RULES: Readonly<Record<UniversalTargetContractType, readonly PackageFactRule[]>> = {
  SUPPLY: [],
  SERVICE: [],
  WORKS: [
    { factKey: "projectId", requiredIn: ["MEMORY", "PCAP", "PPT"] },
    { factKey: "projectVersion", requiredIn: ["MEMORY", "PCAP", "PPT"] },
  ],
  CONCESSION: [
    { factKey: "concessionSubtype", requiredIn: ["MEMORY", "PCAP", "PPT"] },
    { factKey: "operationalRiskTransferred", requiredIn: ["MEMORY", "PCAP"] },
    { factKey: "viabilityStudyId", requiredIn: ["MEMORY", "PCAP"] },
  ],
  MIXED: [
    { factKey: "principalContractType", requiredIn: ["MEMORY", "PCAP", "PPT"] },
    { factKey: "componentStructure", requiredIn: ["MEMORY", "PCAP"] },
  ],
};

/**
 * Auditoría de paquete administrativo: además de comparar los hechos que estén
 * presentes, exige que un núcleo mínimo aparezca en los documentos donde debe
 * mantenerse coherente. No extrae hechos del texto libre: recibe snapshots
 * producidos por renderizadores/extractores trazables.
 */
export function auditUniversalAdministrativePackage(
  contractType: UniversalTargetContractType,
  snapshots: readonly UniversalDocumentFactSnapshot[],
): UniversalAdministrativePackageAuditResult {
  const base = auditUniversalCrossDocuments(snapshots);
  const blockers = [...base.blockers];
  const missingFacts: { factKey: string; document: AuditedAdministrativeDocument }[] = [];
  const byDocument = new Map(snapshots.map(snapshot => [snapshot.document, snapshot]));
  const rules = [...COMMON_RULES, ...FAMILY_RULES[contractType]];

  for (const rule of rules) {
    for (const document of rule.requiredIn) {
      const snapshot = byDocument.get(document);
      if (!snapshot) continue; // el auditor base ya bloquea el documento ausente
      const value = snapshot.facts[rule.factKey];
      if (value === undefined || value === null || value === "") {
        missingFacts.push({ factKey: rule.factKey, document });
        blockers.push(`Falta el hecho obligatorio ${rule.factKey} en ${document} para auditar ${contractType}.`);
      }
    }
  }

  return {
    ready: blockers.length === 0,
    comparedFacts: base.comparedFacts,
    blockers,
    missingFacts,
    humanValidationRequired: true,
  };
}
