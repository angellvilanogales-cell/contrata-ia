import { describe, expect, it } from "vitest";
import { evaluateFerreteriaThreeDocumentClosureGate } from "../src/application/intake/lb49/FerreteriaThreeDocumentClosureGate";

describe("LB49 - cierre conjunto PCAP + Memoria + PPT", () => {
  it("cierra los tres documentos en ingeniería", () => {
    const r=evaluateFerreteriaThreeDocumentClosureGate();
    expect(r.engineeringClosed).toBe(true);
    expect(r.blockers).toEqual([]);
  });
  it("mantiene fuera del cierre técnico la aceptación humana y productionReady", () => {
    const r=evaluateFerreteriaThreeDocumentClosureGate();
    expect(r.humanAcceptanceRequired).toBe(true);
    expect(r.runtimeOfficialAssetsStillRequiredForProduction).toBe(true);
    expect(r.productionReady).toBe(false);
  });
});
