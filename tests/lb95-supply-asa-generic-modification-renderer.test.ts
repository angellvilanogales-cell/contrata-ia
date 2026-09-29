import { describe, expect, it } from "vitest";
import { JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION } from "../src/application/intake/lb95/SupplyAsaGenericModificationRenderer";
import { JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION as GENERAL_CONFIGURATION } from "../src/application/intake/lb95/SupplyAsaGeneralPcapRenderer";

const profile = {
  budgetStability: { applicable: false, maximumPercent: 0 },
  needsDa33: { applicable: true, maximumPercent: 15, limits: ["Solo unidades de referencias existentes", "Sin nuevos precios unitarios"] },
  other: { applicable: false, description: "", maximumPercent: 0, limits: [] },
};

describe("LB95 generic Supply ASA modification renderer", () => {
  it("materializa una decisión DA33 explícita sin reutilizar el texto ferretería", () => {
    const formatter = JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.14.da33.limites"];
    expect(formatter).toBeTypeOf("function");
    const xml = formatter!(profile, "execution.plannedModificationRegime");
    expect(xml).toContain("15 %");
    expect(xml).toContain("Solo unidades de referencias existentes");
    expect(xml).not.toContain("20 % del presupuesto máximo inicialmente aprobado");
  });

  it("bloquea porcentajes de modificación prevista superiores al 20 por ciento", () => {
    const formatter = JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.14.da33.causa"];
    expect(() => formatter!({ ...profile, needsDa33: { ...profile.needsDa33, maximumPercent: 21 } }, "execution.plannedModificationRegime")).toThrow(/20 %/);
  });

  it("exige porcentaje cero cuando una causa se declara no aplicable", () => {
    const formatter = JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.14.otras.causa"];
    expect(() => formatter!({ ...profile, other: { applicable: false, description: "", maximumPercent: 10, limits: [] } }, "execution.plannedModificationRegime")).toThrow(/porcentaje debe ser 0/);
  });

  it("materializa con 0 % la estabilidad no aplicable validada en el modelo europeo", () => {
    const formatter = GENERAL_CONFIGURATION.formattersByTemplateId?.["JDA-PCAP-SUPPLY-ASA-EU_FUNDS-2025-12-17"]?.["pcap.anexoI.14.estabilidad.porcentaje"];
    expect(formatter).toBeTypeOf("function");
    const xml = formatter!(profile, "execution.plannedModificationRegime");
    expect(xml).toContain('<text:span text:style-name="T1822">0</text:span>');
  });

  it("bloquea una causa no aplicable con porcentaje distinto de cero también en el renderer general", () => {
    const formatter = GENERAL_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.14.estabilidad.porcentaje"];
    expect(() => formatter!({ ...profile, budgetStability: { applicable: false, maximumPercent: 5 } }, "execution.plannedModificationRegime")).toThrow(/debe ser 0/);
  });
});
