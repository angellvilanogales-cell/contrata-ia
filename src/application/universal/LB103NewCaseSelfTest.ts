import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { AdaptiveCaseStore } from "../../infrastructure/operations/lb7/AdaptiveCaseStore";
import { UniversalEvidenceCaseService } from "../intake/lb53/UniversalEvidenceCaseService";
import type { UniversalEditableTemplateBinaryStore } from "../intake/lb23/UniversalOdtProductionRenderer";
import { evaluateLB103ServerValidatedPreflight } from "./LB103ServerValidatedPreflight";
import { generateLB103AuthoritativeSupplyPackage } from "./LB103AuthoritativeSupplyGeneration";
import { NEW_SUPPLY_VALUES } from "./LB103SyntheticNewCaseFixture";

/** Isolated technical probe. It never registers a human UAT session or acceptance. */
export async function runLB103NewCaseSelfTest(templateStore: UniversalEditableTemplateBinaryStore) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "contrata-lb103-synthetic-"));
  const result = { synthetic: true, countsAsHumanAcceptance: false, productionReady: false, humanAcceptanceRequired: true } as const;
  try {
    const store = new AdaptiveCaseStore(root);
    const created = store.create();
    const evidence = new UniversalEvidenceCaseService(store);
    for (const [fieldPath, value] of Object.entries(NEW_SUPPLY_VALUES)) {
      evidence.declare(created.caseId, {fieldPath, value, sourceId: "SYNTHETIC_TECHNICAL_TEST_NOT_LEGAL_EVIDENCE"}, "AUTOMATED_TEST");
      evidence.validate(created.caseId, fieldPath, "AUTOMATED_TEST_NOT_HUMAN_ACCEPTANCE");
    }
    store.save(created.caseId, {__lb103: {contractType: "SUPPLY", phase: "READY_FOR_DOCUMENT_GENERATION", decisions: {}}} as never);
    const before = store.get(created.caseId);
    const restored = new AdaptiveCaseStore(root).get(created.caseId);
    const persisted = JSON.stringify(before) === JSON.stringify(restored);
    const preflight = evaluateLB103ServerValidatedPreflight(restored);
    if (!persisted || !preflight.generationReady || !preflight.snapshot || !preflight.documentarySelection) {
      return {...result, ready: false, persisted, blockers: [...preflight.blockers, ...(preflight.completion?.blockers ?? [])]};
    }
    const presentedSeals = {snapshotSha256: preflight.snapshot.sha256, documentarySelectionSha256: preflight.documentarySelection.sha256};
    const first = await generateLB103AuthoritativeSupplyPackage({caseValue: restored, presentedSeals, templateStore});
    if (!first.ready || !first.package?.sha256) return {...result, ready: false, persisted, blockers: first.blockers};
    const second = await generateLB103AuthoritativeSupplyPackage({caseValue: restored, presentedSeals, templateStore});
    const deterministic = second.ready && first.package.sha256 === second.package?.sha256;
    return {...result, ready: deterministic, persisted, deterministic, packageSha256: first.package.sha256,
      documents: first.package.manifest?.documents, authoritativeSeals: presentedSeals,
      blockers: deterministic ? [] : ["El mismo expediente no produjo el mismo paquete.", ...second.blockers]};
  } catch (error) {
    return {...result, ready: false, blockers: [error instanceof Error ? error.message : String(error)]};
  } finally { fs.rmSync(root, {recursive: true, force: true}); }
}
