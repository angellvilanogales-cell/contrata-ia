export type ServiceGeneralTemplateKind = "MEMORY" | "PPT" | "PCAP";

export type ServiceGeneralTemplateSourceAuthority =
  | "SERVICE_REAL_CORPUS_2024_2026_PLUS_JDA_ADMIN_STYLE"
  | "JDA_RECOMMENDED_SERVICE_OPEN_2025_12_CURRENT_PORTAL_PLUS_SERVICE_REAL_CORPUS_2026";

export interface ServiceGeneralTemplateManifestRecord {
  templateId: string;
  kind: ServiceGeneralTemplateKind;
  fileName: string;
  mediaType: "application/vnd.oasis.opendocument.text";
  expectedSha256: string;
  expectedStyleFingerprint: string;
  provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE";
  officialModel: false;
  sourceAuthority: ServiceGeneralTemplateSourceAuthority;
  derivationVersion: "LB96-SERVICE-GENERAL-ODT-V2" | "LB96-SERVICE-PCAP-DERIVED-ODT-V2";
  humanValidationRequired: true;
  slots: readonly string[];
}

/**
 * Baseline físico LB96. Memoria y PPT son activos generales derivados de
 * Contrata-IA. El PCAP Service V2 también es derivado y NO se presenta como
 * modelo oficial: su estructura y ámbito se contrastan con el modelo vigente
 * de Servicios por procedimiento abierto/autofinanciado publicado por la Junta
 * de Andalucía (actualización diciembre de 2025) y con el corpus Service real
 * 2026. Los tres activos conservan identidad física independiente y exigen
 * validación humana antes de aprobación o firma.
 */
export const SERVICE_GENERAL_TEMPLATE_MANIFEST: readonly ServiceGeneralTemplateManifestRecord[] = [
  {
    templateId: "contrata-ia:service:memory:general:LB96-SERVICE-GENERAL-ODT-V2",
    kind: "MEMORY",
    fileName: "LB96_MEMORY_SERVICE_GENERAL_V2.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "a35dae9200d9f55ed55265383a49ca2c0683509bec9ec34e6af337fdcf494096",
    expectedStyleFingerprint: "sha256:fe86bb228f315b9ca41511f1a2a484111f512bfba289855f4576538a24dc3750",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "SERVICE_REAL_CORPUS_2024_2026_PLUS_JDA_ADMIN_STYLE",
    derivationVersion: "LB96-SERVICE-GENERAL-ODT-V2",
    humanValidationRequired: true,
    slots: ["caseId", "needAndOwnMeans", "object", "cpvMain", "lotsRegime", "economicSummary", "durationSummary", "procedureAndSolvencySummary", "awardCriteriaSummary", "personnelAndExecutionSummary", "modificationSummary"],
  },
  {
    templateId: "contrata-ia:service:ppt:general:LB96-SERVICE-GENERAL-ODT-V2",
    kind: "PPT",
    fileName: "LB96_PPT_SERVICE_GENERAL_V2.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "87a823c9a765469ee0b851e01e494b7b9f4f5a0bc4e4ffd66bc442720eae3217",
    expectedStyleFingerprint: "sha256:5a07f964e6bbb97e0a239fa1c847caca0912673c7ee42b81f4f4e18c560cf907",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "SERVICE_REAL_CORPUS_2024_2026_PLUS_JDA_ADMIN_STYLE",
    derivationVersion: "LB96-SERVICE-GENERAL-ODT-V2",
    humanValidationRequired: true,
    slots: ["caseId", "object", "contractManagement", "durationSummary", "executionLocations", "technicalRequirements", "serviceVariantRequirements", "personnelAndMeansRequirements", "serviceControlAndExecutionConditions"],
  },
  {
    templateId: "contrata-ia:service:pcap:general:LB96-SERVICE-PCAP-DERIVED-ODT-V2",
    kind: "PCAP",
    fileName: "LB96_PCAP_SERVICE_GENERAL_V2.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "7a3021f5e8665202b78e49060456a644a472421d1176a58ba4038b5af8148248",
    expectedStyleFingerprint: "sha256:21f3ff8b627be04a347ae63da7681519d143d878d0cc8c2c538cc51b26b02274",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "JDA_RECOMMENDED_SERVICE_OPEN_2025_12_CURRENT_PORTAL_PLUS_SERVICE_REAL_CORPUS_2026",
    derivationVersion: "LB96-SERVICE-PCAP-DERIVED-ODT-V2",
    humanValidationRequired: true,
    slots: ["caseId", "title", "locationSummary", "cpvSummary", "objectSummary", "lotsSummary", "reservedContractSummary", "needsBasedContractSummary", "specificLegalRegimeSummary", "economicSummary", "budgetSummary", "estimatedValueSummary", "priceSummary", "durationSummary", "solvencySummary", "buyerProfileSummary", "procedureSummary", "guaranteesSummary", "awardCriteriaSummary", "specialExecutionConditionsSummary", "subcontractingSummary", "penaltiesSummary", "paymentSummary", "executionSummary", "suspensionSummary", "modificationSummary", "dataProtectionSummary", "subrogationSummary"],
  },
] as const;

export function getServiceGeneralTemplate(kind: ServiceGeneralTemplateKind): ServiceGeneralTemplateManifestRecord {
  const record = SERVICE_GENERAL_TEMPLATE_MANIFEST.find(item => item.kind === kind);
  if (!record) throw new Error(`No existe plantilla general Service para ${kind}.`);
  return record;
}
