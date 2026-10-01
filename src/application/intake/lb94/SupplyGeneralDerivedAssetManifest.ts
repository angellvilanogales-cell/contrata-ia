export interface SupplyGeneralDerivedAssetDescriptor {
  kind: "MEMORIA" | "PPT";
  templateId: string;
  fileName: string;
  sha256: string;
  styleFingerprint: string;
  structuralStyleFingerprint: string;
  donorAssetId: string;
  donorSha256: string;
  donorStyleFingerprint: string;
  derivationVersion: "LB105-SUPPLY-CANONICAL-ODT-V1";
  provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE";
  officialModelClaimed: false;
  humanValidationRequired: true;
}

/**
 * Identidades binarias de las plantillas generales Supply derivadas de forma
 * determinista. Son activos propios de Contrata-IA; no son modelos oficiales
 * de la Comisión Consultiva. Los donantes solo aportan soporte físico/estilos
 * y están verificados por SHA-256.
 */
export const SUPPLY_GENERAL_DERIVED_ASSET_MANIFEST: readonly SupplyGeneralDerivedAssetDescriptor[] = [
  {
    kind: "MEMORIA",
    templateId: "contrata-ia:supply:memory:general:LB105-SUPPLY-CANONICAL-ODT-V1",
    fileName: "LB105_MEMORY_SUPPLY_CANONICAL_V1.odt",
    sha256: "66742bee04da4703832bc41d36d107035c4acd47122a35e2ccb75f0896aa01e2",
    styleFingerprint: "sha256:7102333e7a4e164bb860faf27a11848b768d557f319cd06f723825b5f6996222",
    structuralStyleFingerprint: "sha256:825a07ea999b5556b5fa818bcef9ac9b90c0d47246eb7d4172a20a074235f85a",
    donorAssetId: "contrata-ia:supply:memory:general:LB94-SUPPLY-GENERAL-ODT-V2",
    donorSha256: "b032748897f02858d3cce3d3671e4185ef984e8ced68a0c2f5988c6527f7016f",
    donorStyleFingerprint: "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",
    derivationVersion: "LB105-SUPPLY-CANONICAL-ODT-V1",
    provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModelClaimed: false,
    humanValidationRequired: true,
  },
  {
    kind: "PPT",
    templateId: "contrata-ia:supply:ppt:general:LB105-SUPPLY-CANONICAL-ODT-V1",
    fileName: "LB105_PPT_SUPPLY_CANONICAL_V1.odt",
    sha256: "37fd7c3cb2f5cf010ffe9982c8d19d2b9b88372a53bd1ad5ba5405f1a11d84c5",
    styleFingerprint: "sha256:1980e059b6b4a58eab4e893ae6bd1fcc8c6c3f91dbf00804f0b225ddd799ad45",
    structuralStyleFingerprint: "sha256:f729aae4f7c93169244eff1abe103344056885211f75bfbdf28a75fc46857caa",
    donorAssetId: "contrata-ia:supply:ppt:general:LB94-SUPPLY-GENERAL-ODT-V2",
    donorSha256: "6c73d9671a1f8cfe816239d13ead9aaa415acca730d298a4148e770ea947feca",
    donorStyleFingerprint: "sha256:1e8ec6bc5f26597714507c21d702b4f0a2c244e70f2ff0be9121166b6eb5f552",
    derivationVersion: "LB105-SUPPLY-CANONICAL-ODT-V1",
    provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModelClaimed: false,
    humanValidationRequired: true,
  },
] as const;

export function getSupplyGeneralDerivedAsset(kind: "MEMORIA" | "PPT") {
  return SUPPLY_GENERAL_DERIVED_ASSET_MANIFEST.find(item => item.kind === kind);
}
