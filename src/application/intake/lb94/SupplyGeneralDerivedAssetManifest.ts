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
  derivationVersion: "LB94-SUPPLY-GENERAL-ODT-V2";
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
    templateId: "contrata-ia:supply:memory:general:LB94-SUPPLY-GENERAL-ODT-V2",
    fileName: "LB94_MEMORY_SUPPLY_GENERAL_V1.odt",
    sha256: "b032748897f02858d3cce3d3671e4185ef984e8ced68a0c2f5988c6527f7016f",
    styleFingerprint: "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",
    structuralStyleFingerprint: "sha256:72534e58fe42156973521a0e50940ce98317dd83a8a80c38d8d36abf12b0388a",
    donorAssetId: "case:CONTR-2026-240267:memoria:v12:editable",
    donorSha256: "36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",
    donorStyleFingerprint: "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",
    derivationVersion: "LB94-SUPPLY-GENERAL-ODT-V2",
    provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModelClaimed: false,
    humanValidationRequired: true,
  },
  {
    kind: "PPT",
    templateId: "contrata-ia:supply:ppt:general:LB94-SUPPLY-GENERAL-ODT-V2",
    fileName: "LB94_PPT_SUPPLY_GENERAL_V1.odt",
    sha256: "6c73d9671a1f8cfe816239d13ead9aaa415acca730d298a4148e770ea947feca",
    styleFingerprint: "sha256:1e8ec6bc5f26597714507c21d702b4f0a2c244e70f2ff0be9121166b6eb5f552",
    structuralStyleFingerprint: "sha256:88387a3ce5d17fc66ad8e28b4de55cc09c5f0d696bf5e31254195b4b51f4d1db",
    donorAssetId: "case:CONTR-2026-240267:ppt:v6:editable",
    donorSha256: "c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",
    donorStyleFingerprint: "sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390",
    derivationVersion: "LB94-SUPPLY-GENERAL-ODT-V2",
    provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
    officialModelClaimed: false,
    humanValidationRequired: true,
  },
] as const;

export function getSupplyGeneralDerivedAsset(kind: "MEMORIA" | "PPT") {
  return SUPPLY_GENERAL_DERIVED_ASSET_MANIFEST.find(item => item.kind === kind);
}
