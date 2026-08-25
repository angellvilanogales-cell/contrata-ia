import { describe, expect, it } from "vitest";
import {
  evaluateRealTemplateMappingCoverage,
  qualifyRealTemplateMapping,
  RealTemplateMappingProfile,
  RealTemplateSourceEvidence,
} from "../src/application/intake/lb22/UniversalRealTemplateMappingRegistry";
import { evaluateUniversalRealTemplateMappingClosure } from "../src/application/intake/lb22/UniversalRealTemplateMappingClosure";
import {
  JDA_SUPPLY_ASA_DERIVED_EDITABLE_EXAMPLE,
  JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE,
  JDA_SUPPLY_ASA_REFERENCE_SOURCE,
} from "../src/application/intake/lb22/JuntaSupplyAsaRealMapping";

describe("LB22 - modelos oficiales y mapeos reales", () => {
  it("verifica la estructura desde el PDF oficial de referencia pero no lo promociona a activo editable", () => {
    const result = qualifyRealTemplateMapping(JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE, [JDA_SUPPLY_ASA_REFERENCE_SOURCE]);
    expect(result.structurallyVerified).toBe(true);
    expect(result.productionEligible).toBe(false);
    expect(result.mappingSpec).toBeNull();
    expect(result.warnings.join(" ")).toMatch(/PDF|original editable/i);
  });

  it("no permite que una copia ODT derivada se haga pasar por el original oficial", () => {
    const profile: RealTemplateMappingProfile = {
      ...JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE,
      profileId: "derived-profile",
      templateId: "invented-production-id",
      sourceId: JDA_SUPPLY_ASA_DERIVED_EDITABLE_EXAMPLE.sourceId,
    };
    const result = qualifyRealTemplateMapping(profile, [JDA_SUPPLY_ASA_DERIVED_EDITABLE_EXAMPLE]);
    expect(result.structurallyVerified).toBe(true);
    expect(result.productionEligible).toBe(false);
    expect(result.mappingSpec).toBeNull();
  });

  it("no permite que un expediente cumplimentado editable sea modelo genérico", () => {
    const completed: RealTemplateSourceEvidence = {
      sourceId: "completed-case",
      locator: "archive/case.docx",
      fileName: "case.docx",
      mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      qualification: "COMPLETED_CASE_EDITABLE",
      humanValidated: true,
      validatedBy: "reviewer",
    };
    const profile: RealTemplateMappingProfile = {
      ...JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE,
      profileId: "completed-case-profile",
      templateId: "case-template",
      sourceId: completed.sourceId,
    };
    const result = qualifyRealTemplateMapping(profile, [completed]);
    expect(result.productionEligible).toBe(false);
    expect(result.warnings.join(" ")).toMatch(/expediente cumplimentado/i);
  });

  it("rechaza campos y slots inventados o duplicados", () => {
    const invalid: RealTemplateMappingProfile = {
      ...JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE,
      profileId: "invalid",
      slots: [
        { slotId: "x", fieldKey: "not.real", required: true, sourceSection: "1", sourceLabel: "X" },
        { slotId: "x", fieldKey: "object", required: true, sourceSection: "1", sourceLabel: "Y" },
      ],
    };
    const result = qualifyRealTemplateMapping(invalid, [JDA_SUPPLY_ASA_REFERENCE_SOURCE]);
    expect(result.structurallyVerified).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/duplicado/);
    expect(result.blockers.join(" ")).toMatch(/desconocido/);
  });

  it("solo produce UniversalDocumentMappingSpec con original editable oficial validado", () => {
    const original: RealTemplateSourceEvidence = {
      sourceId: "official-original",
      locator: "official/supply-asa.docx",
      fileName: "supply-asa.docx",
      mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      qualification: "OFFICIAL_EDITABLE_ORIGINAL",
      humanValidated: true,
      validatedBy: "template-custodian",
    };
    const profile: RealTemplateMappingProfile = {
      ...JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE,
      profileId: "production-profile",
      templateId: "JDA-PCAP-SUPPLY-ASA-OFFICIAL",
      sourceId: original.sourceId,
    };
    const result = qualifyRealTemplateMapping(profile, [original]);
    expect(result.productionEligible).toBe(true);
    expect(result.mappingSpec?.templateId).toBe("JDA-PCAP-SUPPLY-ASA-OFFICIAL");
    expect(result.mappingSpec?.slots).toHaveLength(profile.slots.length);
  });

  it("informa cobertura estructural pero bloquea producción mientras falte el original editable real", () => {
    const coverage = evaluateRealTemplateMappingCoverage(
      [{ contractType: "SUPPLY", documentKind: "PCAP" }],
      [JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE],
      [JDA_SUPPLY_ASA_REFERENCE_SOURCE],
    );
    expect(coverage.ready).toBe(false);
    expect(coverage.referenceOnlyProfiles).toEqual([JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE.profileId]);
    expect(coverage.blockers.join(" ")).toMatch(/original editable oficial/i);
  });

  it("cierra la ingeniería de LB22 sin falsear que el catálogo ya sea productivo", () => {
    const closure = evaluateUniversalRealTemplateMappingClosure(
      [{ contractType: "SUPPLY", documentKind: "PCAP" }],
      [JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE],
      [JDA_SUPPLY_ASA_REFERENCE_SOURCE],
    );
    expect(closure.engineeringReady).toBe(true);
    expect(closure.productionReady).toBe(false);
    expect(closure.structurallyVerifiedProfiles).toEqual([JDA_SUPPLY_ASA_PCAP_ANEXO_I_REFERENCE_PROFILE.profileId]);
    expect(closure.productionBlockers.join(" ")).toMatch(/original editable oficial/i);
  });
});
