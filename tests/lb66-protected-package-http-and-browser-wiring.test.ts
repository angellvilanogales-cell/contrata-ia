import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { UNIVERSAL_V1_JOURNEY_UI } from "../src/interfaces/lb55/UniversalV1JourneyUi";

describe("LB66 - generación protegida desde navegador", () => {
  it("elimina el 501 provisional del endpoint universal", () => {
    const serverSource = fs.readFileSync("src/interfaces/lb6/LB6Server.ts", "utf8");
    expect(serverSource).toContain("generateFerreteriaV1ProtectedPackage");
    expect(serverSource).toContain("sendBinary(response, 200, pkg.bytes, pkg.mediaType, pkg.fileName)");
    expect(serverSource).not.toMatch(/sendJson\(response,\s*501/);
  });

  it("la UI trata la generación como ZIP y dispara descarga binaria", () => {
    expect(UNIVERSAL_V1_JOURNEY_UI).toContain("application/zip");
    expect(UNIVERSAL_V1_JOURNEY_UI).toContain("URL.createObjectURL(blob)");
    expect(UNIVERSAL_V1_JOURNEY_UI).toContain("PCAP + Memoria + PPT");
    expect(UNIVERSAL_V1_JOURNEY_UI).toContain("manifest.json");
  });
});
