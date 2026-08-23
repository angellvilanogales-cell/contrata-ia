import { describe, expect, it } from "vitest";
import { qualifyRealTemplateMapping } from "../src/application/intake/lb22/UniversalRealTemplateMappingRegistry";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../src/application/intake/lb23/JuntaOfficialEditableTemplateDiscovery";
import {
  FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION,
  FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID,
  JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE,
  JDA_SUPPLY_ASA_LB34_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION,
  evaluateJdaSupplyAsaLb34PhysicalClosure,
} from "../src/application/intake/lb34/JuntaSupplyAsaModificationSection";

describe("LB34 - apartado 14: estabilidad a la baja y DA33 al alza", () => {
  it("conserva las dos causas como direcciones jurídicas distintas, no como un 40 % acumulable", () => {
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.budgetStability.direction).toBe("DOWN");
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.budgetStability.maximumPercent).toBe(20);
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.budgetStability.valueEstimatedTreatment).toBe("DOES_NOT_INCREASE_ESTIMATED_VALUE");
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.needsDa33.direction).toBe("UP");
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.needsDa33.maximumPercent).toBe(20);
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.needsDa33.valueEstimatedTreatment).toBe("INCLUDED_AS_UPWARD_MODIFICATION");
  });

  it("protege la causa DA33 frente a nuevos artículos o nuevos precios unitarios", () => {
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.needsDa33.forbidsNewArticles).toBe(true);
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.needsDa33.forbidsNewUnitPrices).toBe(true);
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.needsDa33.mustBeProcessedBeforeMaximumBudgetExhaustion).toBe(true);
    expect(FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION.needsDa33.requiresReservedCredit).toBe(true);
  });

  it("cierra todos los bloqueos físicos del Anexo I y conserva solo hallazgos no bloqueantes", () => {
    const result = evaluateJdaSupplyAsaLb34PhysicalClosure();
    expect(result.fullPhysicalCoverageReady).toBe(true);
    expect(result.remainingBlockingCount).toBe(0);
    expect(result.blockers).toEqual([]);
    expect(result.nonBlockingFindings.some(item => item.id === "single-price-criterion-motivation")).toBe(true);
    expect(JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.slotIds.length).toBe(JDA_SUPPLY_ASA_LB34_PHYSICAL_BINDINGS.length);
  });

  it("materializa el 20 % a la baja y la causa DA33 solo con el perfil jurídico exacto validado", () => {
    const formatters = JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION.formattersBySlotId!;
    const stability = formatters["pcap.anexoI.14.estabilidad.porcentaje"]?.(FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID, "execution.plannedModificationRegime");
    const cause = formatters["pcap.anexoI.14.da33.causa"]?.(FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID, "execution.plannedModificationRegime");
    const limits = formatters["pcap.anexoI.14.da33.limites"]?.(FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID, "execution.plannedModificationRegime");
    expect(stability).toContain(">20<");
    expect(cause).toMatch(/disposición adicional 33/i);
    expect(limits).toMatch(/Porcentaje máximo de incremento: 20 %/i);
    expect(limits).toMatch(/no podrán incorporarse nuevos artículos/i);
    expect(() => formatters["pcap.anexoI.14.da33.causa"]?.("otro-perfil", "execution.plannedModificationRegime")).toThrow(/solo se materializa con el perfil jurídico/i);
  });

  it("cualifica el mapping final contra el original oficial validado", () => {
    const result = qualifyRealTemplateMapping(JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE, [JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY]);
    expect(result.structurallyVerified).toBe(true);
    expect(result.productionEligible).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.mappingSpec?.slots.map(item => item.slotId)).toContain("pcap.anexoI.14.estabilidad.porcentaje");
    expect(result.mappingSpec?.slots.map(item => item.slotId)).toContain("pcap.anexoI.14.da33.limites");
    expect(result.mappingSpec?.slots.map(item => item.slotId)).toContain("pcap.anexoI.2A.anualidadesTabla");
    expect(result.mappingSpec?.slots.map(item => item.slotId)).toContain("pcap.anexoI.5.tramitacion.ordinariaControl");
  });
});
