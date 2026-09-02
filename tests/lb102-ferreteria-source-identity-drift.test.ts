import { describe, expect, it } from "vitest";
import { LB102_FERRETERIA_SOURCE_ASSETS, FERRETERIA_POST_INTERVENCION_PCAP_TEMPLATE_ID, FERRETERIA_POST_INTERVENCION_MEMORY_TEMPLATE_ID, FERRETERIA_POST_INTERVENCION_PPT_TEMPLATE_ID } from "../src/application/intake/lb102/LB102PersistedPilotTemplateStores";

describe("LB102 - identidad física Ferretería sin deriva", () => {
  it("protege exactamente la nueva tríada post-Intervención", () => {
    const pcap=LB102_FERRETERIA_SOURCE_ASSETS.find(asset=>asset.kind==="PCAP");
    const memory=LB102_FERRETERIA_SOURCE_ASSETS.find(asset=>asset.kind==="MEMORIA");
    const ppt=LB102_FERRETERIA_SOURCE_ASSETS.find(asset=>asset.kind==="PPT");
    expect(LB102_FERRETERIA_SOURCE_ASSETS).toHaveLength(3);
    expect(pcap?.templateId).toBe(FERRETERIA_POST_INTERVENCION_PCAP_TEMPLATE_ID);
    expect(memory?.templateId).toBe(FERRETERIA_POST_INTERVENCION_MEMORY_TEMPLATE_ID);
    expect(ppt?.templateId).toBe(FERRETERIA_POST_INTERVENCION_PPT_TEMPLATE_ID);
    expect(pcap?.sha256).toBe("9c5cdc5b42238c44994e1fc68759c3433a8fe8a84238da8efe113af73edf3a82");
    expect(memory?.sha256).toBe("b10930e825c9fadc574e0e008a07b05746541415aa050bdc42f91dff257ca1c0");
    expect(ppt?.sha256).toBe("b36ec94e4107c4d95fdb6465c4f46909eb806c49411c90e7fccf9dd288782212");
    expect(pcap?.styleFingerprint).toBe("sha256:e8dea86fa199b0fcd330445c9cca988da816caea17a8498cecce2f5da2411bb3");
    expect(memory?.styleFingerprint).toBe("sha256:8e7db289d312e786782fb278ef9d4b3d1e41f2425c419f10f5c3ff4113228065");
    expect(ppt?.styleFingerprint).toBe("sha256:a483412113912881741809575db2361a627b34647d1a94992384572ab87407d0");
  });
  it("mantiene procedencia humana validada del expediente real y nunca la eleva a modelo general", () => {
    for (const asset of LB102_FERRETERIA_SOURCE_ASSETS) {
      expect(asset.sourceId).toContain("CONTR/2026/240267");
      expect(asset.sourceId).toContain("post-intervencion");
      expect(asset.provenanceRole).toBe("HUMAN_VALIDATED_CORRECTED_REAL_CASE_SOURCE");
    }
  });
});
