export type WorksGeneralTemplateKind = "PCAP" | "MEMORY" | "PPT";

export interface WorksGeneralTemplateManifestRecord {
  templateId: string;
  kind: WorksGeneralTemplateKind;
  fileName: string;
  mediaType: "application/vnd.oasis.opendocument.text";
  expectedSha256: string;
  expectedStyleFingerprint: string;
  provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE";
  officialModel: false;
  sourceAuthority: "JDA_RECOMMENDED_WORKS_MODELS_2025_12_PLUS_LCSP_231_244";
  humanValidationRequired: true;
  slots: readonly string[];
}

export const WORKS_GENERAL_TEMPLATE_MANIFEST: readonly WorksGeneralTemplateManifestRecord[] = [
  {
    templateId: "contrata-ia:works:pcap:general:LB97-WORKS-GENERAL-ODT-V1",
    kind: "PCAP",
    fileName: "LB97_PCAP_WORKS_GENERAL_V1.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "6bd51de1c50e7d45a06494e6c81e74dd7ca768a6f9a5d386d9f4b85b31dbd05f",
    expectedStyleFingerprint: "sha256:4689ea501fdfead89fdd3ba7a3c51c3cad7ab8609fdfd0305748a4bf81fac021",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "JDA_RECOMMENDED_WORKS_MODELS_2025_12_PLUS_LCSP_231_244",
    humanValidationRequired: true,
    slots: ["caseId","title","projectSummary","projectApprovalSummary","supervisionSummary","replanteoSummary","objectSummary","cpvSummary","lotsSummary","economicSummary","budgetSummary","estimatedValueSummary","durationSummary","classificationSolvencySummary","procedureSummary","guaranteesSummary","awardCriteriaSummary","executionDirectionSummary","specialExecutionConditionsSummary","subcontractingSummary","penaltiesSummary","certificationPaymentSummary","modificationSummary","receptionGuaranteeSummary","dataProtectionSummary"],
  },
  {
    templateId: "contrata-ia:works:memory:general:LB97-WORKS-GENERAL-ODT-V1",
    kind: "MEMORY",
    fileName: "LB97_MEMORY_WORKS_GENERAL_V1.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "dda54ee8c60a623dedb450d0ecedbf37e0889b92338b38c2ece41952b2b8788d",
    expectedStyleFingerprint: "sha256:4689ea501fdfead89fdd3ba7a3c51c3cad7ab8609fdfd0305748a4bf81fac021",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "JDA_RECOMMENDED_WORKS_MODELS_2025_12_PLUS_LCSP_231_244",
    humanValidationRequired: true,
    slots: ["caseId","needSummary","objectSummary","projectSummary","economicSummary","durationSummary","procedureSummary","classificationSolvencySummary","awardCriteriaSummary","preparationActsSummary","executionSummary"],
  },
  {
    templateId: "contrata-ia:works:ppt:general:LB97-WORKS-GENERAL-ODT-V1",
    kind: "PPT",
    fileName: "LB97_PPT_WORKS_GENERAL_V1.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "e962c9cfe3fed99c92bf1ef3cca7db7b493c8e3c513888e45955cbb88ba0ce89",
    expectedStyleFingerprint: "sha256:4689ea501fdfead89fdd3ba7a3c51c3cad7ab8609fdfd0305748a4bf81fac021",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "JDA_RECOMMENDED_WORKS_MODELS_2025_12_PLUS_LCSP_231_244",
    humanValidationRequired: true,
    slots: ["caseId","objectSummary","projectScopeSummary","technicalRequirementsSummary","executionDirectionSummary","materialsAndQualitySummary","healthSafetyCoordinationSummary","siteConditionsSummary","certificationControlSummary"],
  },
] as const;

export function getWorksGeneralTemplate(kind: WorksGeneralTemplateKind): WorksGeneralTemplateManifestRecord {
  const record = WORKS_GENERAL_TEMPLATE_MANIFEST.find(item => item.kind === kind);
  if (!record) throw new Error(`No existe plantilla general Works para ${kind}.`);
  return record;
}
