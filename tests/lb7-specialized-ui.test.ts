import { afterEach, describe, expect, it } from "vitest";
import type http from "node:http";
import { createLB6Server } from "../src/interfaces/lb6/LB6Server";

let server: http.Server | undefined;
afterEach(async () => {
  if (!server) return;
  await new Promise<void>(resolve => server!.close(() => resolve()));
  server = undefined;
});

async function baseUrl(): Promise<string> {
  server = createLB6Server();
  await new Promise<void>((resolve, reject) => {
    server!.once("error", reject);
    server!.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Servidor de prueba sin puerto TCP.");
  return `http://127.0.0.1:${address.port}`;
}

describe("LB-7 specialized pilot interface", () => {
  it("publishes a human-facing specialized screen linked from the main pilot UI", async () => {
    const base = await baseUrl();
    const main = await (await fetch(base)).text();
    expect(main).toContain("Configurar EVENT_SERVICES / revisión prejurídica");
    const specialized = await fetch(`${base}/specialized?caseId=DEMO`);
    expect(specialized.status).toBe(200);
    const html = await specialized.text();
    expect(html).toContain("EVENT_SERVICES");
    expect(html).toContain("Revisión jurídica preventiva");
    expect(html).toContain("No sustituye el informe del Letrado");
  });

  it("configures event facts and preventive review through the HTTP workflow", async () => {
    const base = await baseUrl();
    const createdResponse = await fetch(`${base}/api/cases`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "GUIDED" })
    });
    expect(createdResponse.status).toBe(201);
    const created = await createdResponse.json() as { id: string };

    const eventResponse = await fetch(`${base}/api/cases/${encodeURIComponent(created.id)}/event-services`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        features: ["VENUE", "AUDIOVISUAL"],
        answers: {
          eventOfficialNames: "Gala institucional",
          eventCount: "1",
          publicPurposeAndNeed: "Finalidad aportada por la unidad promotora",
          datesOrTimeWindow: "Octubre de 2026",
          locationsAndNuts: "Sevilla / ES618",
          lots: "Lote único",
          cpvByLotOrPrestacion: "79952000-2"
        }
      })
    });
    expect(eventResponse.status).toBe(200);
    const eventBody = await eventResponse.json() as { eventConfigured: boolean };
    expect(eventBody.eventConfigured).toBe(true);

    const legalResponse = await fetch(`${base}/api/cases/${encodeURIComponent(created.id)}/pre-legal-review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contractType: "SERVICES",
        usesOfficialRecommendedPcapModel: true,
        needsBasedUnderDa33: false,
        singleAwardCriterion: false,
        plannedModification: false,
        modificationAllowsNewUnpricedItems: false,
        catalogueOpenEnded: false
      })
    });
    expect(legalResponse.status).toBe(200);
    const legalBody = await legalResponse.json() as { preLegalConfigured: boolean };
    expect(legalBody.preLegalConfigured).toBe(true);
  });

  it("advertises the specialized workflow in health status", async () => {
    const base = await baseUrl();
    const response = await fetch(`${base}/api/health`);
    const health = await response.json() as Record<string, unknown>;
    expect(health.status).toBe("ok");
    expect(health.specializedWorkflow).toBe(true);
  });
});
