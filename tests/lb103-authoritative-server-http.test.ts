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
      expect(adaptiveHtml).toContain('/lb107-initial-proposal.js');
      expect(adaptiveHtml).toContain('/lb108-economic-starting-point.js');
      expect(adaptiveHtml).toContain('/lb109-procedure-processing.js');
      expect(adaptiveHtml).toContain('/lb110-capacity-solvency.js');
      expect(adaptiveHtml).toContain('/lb111-award-criteria.js');

      const virginScript = await fetch(`${base}/lb106-virgin-pilot.js`);
      expect(virginScript.status).toBe(200);
      expect(await virginScript.text()).toContain("Crear expediente piloto virgen");

      const initialScript = await fetch(`${base}/lb107-initial-proposal.js`);
      expect(initialScript.status).toBe(200);
      expect(await initialScript.text()).toContain("Confirmar decisiones iniciales");

      const economicScript = await fetch(`${base}/lb108-economic-starting-point.js`);
      expect(economicScript.status).toBe(200);
      expect(await economicScript.text()).toContain("Crédito máximo disponible");

      const procedureScript = await fetch(`${base}/lb109-procedure-processing.js`);
      expect(procedureScript.status).toBe(200);
      expect(await procedureScript.text()).toContain("Procedimiento y tramitación");

      const solvencyScript = await fetch(`${base}/lb110-capacity-solvency.js`);
      expect(solvencyScript.status).toBe(200);
      expect(await solvencyScript.text()).toContain("Capacidad, habilitación y solvencia");

      const awardScript = await fetch(`${base}/lb111-award-criteria.js`);
      expect(awardScript.status).toBe(200);
      expect(await awardScript.text()).toContain("Criterios de adjudicación");

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

      const initialProposal = await fetch(`${base}/api/lb107/initial-proposal`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: "Necesitamos adquirir artículos de ferretería para pequeñas reparaciones en edificios públicos." }),
      });
      expect(initialProposal.status).toBe(200);
      const initialProposalBody = await initialProposal.json() as any;
      expect(initialProposalBody).toMatchObject({
        contractType: { recommended: "SUPPLY" },
        humanValidationRequired: true,
        productionReady: false,
      });
      expect(initialProposalBody.cpvCandidates[0]).toMatchObject({ code: "44316400-2", suggestedRole: "PRIMARY" });

      const pendingValuation = await fetch(`${base}/api/lb108/economic-starting-point`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ startingPoint: "NEED_PENDING_VALUATION", contractType: "SUPPLY", valuationRoute: "MARKET_CONSULTATION" }),
      });
      expect(pendingValuation.status).toBe(200);
      expect(await pendingValuation.json()).toMatchObject({
        status: "VALUATION_REQUIRED",
        procedure: { code: "PENDING" },
        generationBlocked: true,
        humanValidationRequired: true,
        productionReady: false,
      });

      const procedureProposal = await fetch(`${base}/api/lb109/procedure-processing`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contractType: "SUPPLY",
          pblVatIncludedCents: 6_050_000,
          legalEstimatedValueExVatCents: 5_000_000,
          authorityProfile: "OTHER_PUBLIC_ADMINISTRATION",
          recurrentOrForeseeableNeed: false,
          artificialSplittingRisk: false,
          allAwardCriteriaFormulaBased: true,
          judgmentCriteriaPercent: 0,
          processingPreference: "ORDINARY",
        }),
      });
      expect(procedureProposal.status).toBe(200);
      expect(await procedureProposal.json()).toMatchObject({
        proposedProcedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
        thresholdBasis: { magnitude: "LEGAL_ESTIMATED_VALUE_EX_VAT" },
        humanValidationRequired: true,
        generationBlocked: true,
        productionReady: false,
      });

      const solvencyProposal = await fetch(`${base}/api/lb110/capacity-solvency`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contractType: "SUPPLY", procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO", object: "Suministro de material", specificProfessionalAuthorizationRequired: false }),
      });
      expect(solvencyProposal.status).toBe(200);
      expect(await solvencyProposal.json()).toMatchObject({
        regime: "SOLVENCY_ACCREDITATION_EXEMPT",
        humanValidationRequired: true,
        generationBlocked: true,
        productionReady: false,
      });

      const awardProposal = await fetch(`${base}/api/lb111/award-criteria`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ procedure:"ABIERTO_SIMPLIFICADO_ABREVIADO",contractType:"SUPPLY",intellectualService:false,laborIntensiveOrSpecialService:false,technicallyImprovableOrComplex:false,criteria:[{name:"Precio",weight:100,kind:"COST",evaluation:"FORMULA",formulaOrMethod:"P = 100 × oferta mínima / oferta valorada",objectLinkReason:"Coste del suministro"}],singleCriterionMotivation:"Suministro completamente definido.",abnormalityRegime:"RGLCAP_ART85_PRICE_ONLY",tieBreakRegime:"STATUTORY_ART147_2" }),
      });
      expect(awardProposal.status).toBe(200);
      expect(await awardProposal.json()).toMatchObject({ formulaWeight:100, judgmentWeight:0, humanValidationRequired:true, generationBlocked:true, productionReady:false });

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
