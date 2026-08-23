import { describe, expect, it } from "vitest";
import {
  JDA_SUPPLY_ASA_LB31_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB31_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES,
  JDA_SUPPLY_ASA_LB31_RENDERER_CONFIGURATION,
  evaluateJdaSupplyAsaLb31PhysicalClosure,
} from "../src/application/intake/lb31/JuntaSupplyAsaRemainingPhysicalClosure";

describe("LB31 - cierre seguro de bloqueos físicos restantes", () => {
  it("incorpora la decisión de contratación reservada como binding textual exacto", () => {
    expect(JDA_SUPPLY_ASA_LB31_EDITABLE_ASSET.slotIds).toContain("pcap.anexoI.1B.contratoReservado");
    expect(JDA_SUPPLY_ASA_LB31_EDITABLE_ASSET.slotIds.length).toBe(JDA_SUPPLY_ASA_LB31_PHYSICAL_BINDINGS.length);
    const formatter = JDA_SUPPLY_ASA_LB31_RENDERER_CONFIGURATION.formattersBySlotId?.["pcap.anexoI.1B.contratoReservado"];
    expect(formatter?.(false, "administrative.reservedContractDa4")).toBe("No");
    expect(formatter?.(true, "administrative.reservedContractDa4")).toBe("Sí");
  });

  it("no inventa un slot de motivación que no existe en el modelo oficial", () => {
    const motivation = JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES.find(item => item.id === "single-price-criterion-motivation");
    expect(motivation?.status).toBe("NO_DEDICATED_PHYSICAL_SLOT");
    expect(motivation?.blockingForFullRender).toBe(false);
    expect(motivation?.treatment).toMatch(/no fabricar un slot físico inexistente/i);
  });

  it("mantiene bloqueadas las mutaciones ODF estructurales no certificadas", () => {
    const closure = evaluateJdaSupplyAsaLb31PhysicalClosure();
    expect(closure.fullPhysicalCoverageReady).toBe(false);
    expect(closure.remainingBlockingCount).toBe(3);
    expect(closure.blockers.map(item => item.id)).toEqual([
      "annualities-budget-table",
      "processing-ordinary-urgent-controls",
      "planned-modification-section",
    ]);
  });

  it("impide sustituir controles y tablas por texto plano", () => {
    const controls = JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES.find(item => item.id === "processing-ordinary-urgent-controls");
    const table = JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES.find(item => item.id === "annualities-budget-table");
    expect(controls?.treatment).toMatch(/no sustituirlo por texto ni símbolos Unicode/i);
    expect(table?.treatment).toMatch(/mutación estructurada de tabla/i);
  });
});
