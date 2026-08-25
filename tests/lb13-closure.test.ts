import { describe, expect, it } from "vitest";
import { getCanonicalComponent } from "../src/architecture";
import {
  BLOCK_13_STATUS,
  UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION,
} from "../src/domain/expediente/UniversalExpedienteV13";

describe("Bloque 13 - cierre del objeto universal", () => {
  it("estabiliza el schema universal en 13.0.0", () => {
    expect(UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION).toBe("13.0.0");
    expect(BLOCK_13_STATUS).toBe("UNIVERSAL_EXPEDIENTE_STABLE");
  });

  it("mantiene UniversalExpedienteV13 como única autoridad arquitectónica del expediente", () => {
    const expediente = getCanonicalComponent("expediente");
    expect(expediente.contract).toBe("UniversalExpedienteV13");
    expect(expediente.canonicalPath).toBe("src/domain/expediente/UniversalExpedienteV13.ts");
    expect(expediente.legacyPaths).toContain("src/domain/expediente/CanonicalExpedienteState.ts");
    expect(expediente.legacyPaths).toContain("src/domain/expediente/ExpedienteContext.ts");
  });
});
