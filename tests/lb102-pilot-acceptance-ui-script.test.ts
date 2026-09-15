import { describe, expect, it } from "vitest";
import { LB102_PILOT_ACCEPTANCE_UI } from "../src/interfaces/lb102/LB102PilotAcceptanceUi";

describe("LB102 pilot acceptance UI client script", () => {
  it("contiene un script JavaScript sintácticamente válido", () => {
    const match = /<script>([\s\S]*?)<\/script>/.exec(LB102_PILOT_ACCEPTANCE_UI);
    expect(match?.[1]).toBeTruthy();
    expect(() => new Function(match?.[1] ?? "")).not.toThrow();
  });

  it("expone login y catálogo de paquetes sin SHA manual", () => {
    expect(LB102_PILOT_ACCEPTANCE_UI).toContain("async function login()");
    expect(LB102_PILOT_ACCEPTANCE_UI).toContain("Generar y descargar ZIP");
    expect(LB102_PILOT_ACCEPTANCE_UI).not.toContain("SHA-256 del ZIP revisado");
  });

  it("consume el estado físico unificado y no reabre fuentes Ferretería V12/V6", () => {
    expect(LB102_PILOT_ACCEPTANCE_UI).toContain("/api/lb102/source-assets");
    expect(LB102_PILOT_ACCEPTANCE_UI).toContain("PCAP V8 + Memoria V14 + PPT V8");
    expect(LB102_PILOT_ACCEPTANCE_UI).toContain("1.596,06 €");
    expect(LB102_PILOT_ACCEPTANCE_UI).toContain("25.325,86 €");
    expect(LB102_PILOT_ACCEPTANCE_UI).not.toContain("Memoria V12 letrado");
    expect(LB102_PILOT_ACCEPTANCE_UI).not.toContain("PPT V6 (.odt)");
    expect(LB102_PILOT_ACCEPTANCE_UI).not.toContain("/api/lb102/ferreteria-sources/");
  });
});
