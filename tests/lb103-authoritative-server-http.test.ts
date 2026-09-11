import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import type { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { AdaptiveCaseStore, type AdaptiveStoredCase } from "../src/infrastructure/operations/lb7/AdaptiveCaseStore";
import { createLB103AuthoritativeServer } from "../src/interfaces/lb103/LB103AuthoritativeServer";

function validated(key: string, value: unknown): EvidenceField<unknown> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: `ui:http:${key}` }],
    humanValidationRequired: true,
    humanValidated: true,
    humanValidation: { by: "reviewer-http", at: "2026-09-07T12:00:00.000Z" },
  };
}

function supplyCase(): AdaptiveStoredCase {
  return {
    caseId: "EXP-HTTP12345678",
    answers: {
      __lb103: { contractType: "SUPPLY", decisions: {}, phase: "READY_FOR_DOCUMENT_GENERATION" },
    } as any,
    universalEvidence: {
      contractType: validated("contractType", "SUPPLY"),
      object: validated("object", "Suministro de consumibles y materiales"),
      cpvMain: validated("cpvMain", "44510000-8"),
      "lots.divisionIntoLots": validated("lots.divisionIntoLots", true),
      procedure: validated("procedure", "ABIERTO_SIMPLIFICADO_ABREVIADO"),
      "economic.fundingSource": validated("economic.fundingSource", "AUTOFINANCED"),
      "economic.needsBasedContractDa33": validated("economic.needsBasedContractDa33", true),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 1000000),
      "economic.legalEstimatedValueCents": validated("economic.legalEstimatedValueCents", 1500000),
    },
    createdAt: "2026-09-07T11:00:00.000Z",
    updatedAt: "2026-09-07T12:00:00.000Z",
  };
}

describe("LB103 · runtime HTTP autoritativo", () => {
  it("expone a /adaptive el preflight sellado del mismo expediente persistido", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-lb103-http-"));
    const store = new AdaptiveCaseStore(path.join(root, "adaptive-cases"));
    store.restore(supplyCase());
    const server = createLB103AuthoritativeServer(store);

    try {
      await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => resolve());
      });
      const port = (server.address() as AddressInfo).port;
      const base = `http://127.0.0.1:${port}`;

      const adaptive = await fetch(`${base}/adaptive`);
      expect(adaptive.status).toBe(200);
      const adaptiveHtml = await adaptive.text();
      expect(adaptiveHtml).toContain('/lb103-authoritative-generation.js');
      expect(adaptiveHtml).toContain('/lb106-virgin-pilot.js');

      const virginScript = await fetch(`${base}/lb106-virgin-pilot.js`);
      expect(virginScript.status).toBe(200);
      expect(await virginScript.text()).toContain("Crear expediente piloto virgen");

      const response = await fetch(`${base}/api/adaptive/cases/EXP-HTTP12345678/lb103-preflight`);
      expect(response.status).toBe(200);
      const preflight = await response.json() as any;
      expect(preflight.snapshotReady).toBe(true);
      expect(preflight.packageReady).toBe(true);
      expect(preflight.snapshot?.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(preflight.documentarySelection?.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(preflight.blockers).toEqual([]);
      expect(preflight.humanAcceptanceStillRequired).toBe(true);
      expect(preflight.productionReady).toBe(false);

      const version = await fetch(`${base}/api/runtime-version`);
      expect(version.status).toBe(200);
      expect(await version.json()).toMatchObject({
        runtime: "LB103_AUTHORITATIVE_OVER_LB102",
        lb103Authoritative: true,
        lb102SourceIngressPreserved: true,
        humanAcceptanceRequired: true,
        productionReady: false,
      });

      const matrixResponse = await fetch(`${base}/api/lb106/decision-matrix`);
      expect(matrixResponse.status).toBe(200);
      expect(await matrixResponse.json()).toMatchObject({
        ready: true,
        audit: { decisionCount: 20, coveredMemorySections: 19, coveredPptSections: 12 },
        humanConsentRequired: true,
        productionReady: false,
      });

      const virginResponse = await fetch(`${base}/api/lb106/virgin-pilot`);
      expect(virginResponse.status).toBe(200);
      expect(await virginResponse.json()).toMatchObject({
        readyForHumanStart: true,
        readyForGeneration: false,
        virgin: true,
        answersPreloaded: false,
        sourceCaseIdsUsed: [],
      });

      const syntheticDownload = await fetch(`${base}/api/lb105/normalized-synthetic-package`);
      expect(syntheticDownload.status).toBe(503);
      expect(await syntheticDownload.json()).toMatchObject({
        synthetic: true,
        productionReady: false,
      });

      const candidates = await fetch(`${base}/api/lb105/normalized-template-candidates`);
      expect(candidates.status).toBe(503);
      expect(await candidates.json()).toMatchObject({
        synthetic: true,
        productionReady: false,
      });
    } finally {
      await new Promise<void>(resolve => server.close(() => resolve()));
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
