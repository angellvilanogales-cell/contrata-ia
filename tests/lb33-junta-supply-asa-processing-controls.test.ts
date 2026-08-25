import { describe, expect, it } from "vitest";
import {
  JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB33_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_LB33_RENDERER_CONFIGURATION,
  evaluateJdaSupplyAsaLb33PhysicalClosure,
} from "../src/application/intake/lb33/JuntaSupplyAsaProcessingControls";

describe("LB33 - controles ODF de tramitación", () => {
  it("mantiene inventario físico exacto", () => {
    expect(JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET.slotIds.length).toBe(JDA_SUPPLY_ASA_LB33_PHYSICAL_BINDINGS.length);
    expect(JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET.slotIds).toContain("pcap.anexoI.5.tramitacion.ordinariaControl");
    expect(JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET.slotIds).toContain("pcap.anexoI.5.tramitacion.urgenteControl");
  });

  it("marca Ordinaria y desmarca Urgente para el expediente real", () => {
    const f = JDA_SUPPLY_ASA_LB33_RENDERER_CONFIGURATION.formattersBySlotId!;
    const ordinary = f["pcap.anexoI.5.tramitacion.ordinariaControl"]?.("ORDINARIA", "processing.processingType") ?? "";
    const urgent = f["pcap.anexoI.5.tramitacion.urgenteControl"]?.("ORDINARIA", "processing.processingType") ?? "";
    expect(ordinary).toContain('form:current-state="checked"');
    expect(urgent).toContain('form:current-state="unchecked"');
    expect(ordinary).toContain('xml:id="control9"');
    expect(urgent).toContain('xml:id="control10"');
  });

  it("invierte estados de forma determinista para tramitación urgente", () => {
    const f = JDA_SUPPLY_ASA_LB33_RENDERER_CONFIGURATION.formattersBySlotId!;
    expect(f["pcap.anexoI.5.tramitacion.ordinariaControl"]?.("URGENTE", "processing.processingType")).toContain('form:current-state="unchecked"');
    expect(f["pcap.anexoI.5.tramitacion.urgenteControl"]?.("URGENTE", "processing.processingType")).toContain('form:current-state="checked"');
  });

  it("deja como único bloqueo físico real la sección estructurada de modificación", () => {
    const closure = evaluateJdaSupplyAsaLb33PhysicalClosure();
    expect(closure.remainingBlockingCount).toBe(1);
    expect(closure.blockers.map(item => item.id)).toEqual(["planned-modification-section"]);
  });
});
