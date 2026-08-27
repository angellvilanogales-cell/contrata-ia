export type ServiceGeneralTemplateKind = "MEMORY" | "PPT";

export interface ServiceGeneralTemplateManifestRecord {
  templateId: string;
  kind: ServiceGeneralTemplateKind;
  fileName: string;
  mediaType: "application/vnd.oasis.opendocument.text";
  expectedSha256: string;
  expectedStyleFingerprint: string;
  provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE";
  officialModel: false;
  sourceAuthority: "SERVICE_REAL_CORPUS_PLUS_ADMIN_STYLE_DONOR";
  humanValidationRequired: true;
  slots: readonly string[];
}

export const SERVICE_GENERAL_TEMPLATE_MANIFEST: readonly ServiceGeneralTemplateManifestRecord[] = [
  {
    templateId: "contrata-ia:service:memory:general:LB96-SERVICE-GENERAL-ODT-V1",
    kind: "MEMORY",
    fileName: "LB96_MEMORY_SERVICE_GENERAL_V1.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "0c07893f6c4645c1380568f3a35722bfb1ec91699d8453c5ebbcb0da346d30a2",
    expectedStyleFingerprint: "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "SERVICE_REAL_CORPUS_PLUS_ADMIN_STYLE_DONOR",
    humanValidationRequired: true,
    slots: ["caseId", "needAndOwnMeans", "object", "cpvMain", "lotsRegime", "economicSummary", "durationSummary", "procedureAndSolvencySummary", "awardCriteriaSummary", "personnelAndExecutionSummary", "modificationSummary"],
  },
  {
    templateId: "contrata-ia:service:ppt:general:LB96-SERVICE-GENERAL-ODT-V1",
    kind: "PPT",
    fileName: "LB96_PPT_SERVICE_GENERAL_V1.odt",
    mediaType: "application/vnd.oasis.opendocument.text",
    expectedSha256: "a2543a4ecc07f0592d8bad07eb27a77e463d3aa82456990575c011a0a0f41451",
    expectedStyleFingerprint: "sha256:1e8ec6bc5f26597714507c21d702b4f0a2c244e70f2ff0be9121166b6eb5f552",
    provenance: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModel: false,
    sourceAuthority: "SERVICE_REAL_CORPUS_PLUS_ADMIN_STYLE_DONOR",
    humanValidationRequired: true,
    slots: ["caseId", "object", "contractManagement", "durationSummary", "executionLocations", "technicalRequirements", "serviceVariantRequirements", "personnelAndMeansRequirements", "serviceControlAndExecutionConditions"],
  },
] as const;

export function getServiceGeneralTemplate(kind: ServiceGeneralTemplateKind): ServiceGeneralTemplateManifestRecord {
  const record = SERVICE_GENERAL_TEMPLATE_MANIFEST.find(item => item.kind === kind);
  if (!record) throw new Error(`No existe plantilla general Service para ${kind}.`);
  return record;
}
