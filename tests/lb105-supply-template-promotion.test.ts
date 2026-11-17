import { describe, expect, it } from "vitest";
import { ensurePersistedLb105SupplyTemplates } from "../src/application/intake/lb105/LB105SupplyTemplatePromotion";
import { SUPPLY_GENERAL_DERIVED_ASSET_MANIFEST } from "../src/application/intake/lb94/SupplyGeneralDerivedAssetManifest";

describe("LB105 · promoción persistente de plantillas Supply", () => {
  it("falla cerrada si el almacén no está configurado", async () => {
    await expect(ensurePersistedLb105SupplyTemplates({})).resolves.toMatchObject({
      configured: false,
      ready: false,
      promoted: [],
    });
  });

  it("fija identidades V3 independientes y no atribuye oficialidad", () => {
    expect(SUPPLY_GENERAL_DERIVED_ASSET_MANIFEST).toEqual(expect.arrayContaining([
      expect.objectContaining({kind:"MEMORIA",templateId:"contrata-ia:supply:memory:general:LB105-SUPPLY-CANONICAL-ODT-V1",sha256:"66742bee04da4703832bc41d36d107035c4acd47122a35e2ccb75f0896aa01e2",officialModelClaimed:false,humanValidationRequired:true}),
      expect.objectContaining({kind:"PPT",templateId:"contrata-ia:supply:ppt:general:LB105-SUPPLY-CANONICAL-ODT-V1",sha256:"37fd7c3cb2f5cf010ffe9982c8d19d2b9b88372a53bd1ad5ba5405f1a11d84c5",officialModelClaimed:false,humanValidationRequired:true}),
    ]));
  });
});
