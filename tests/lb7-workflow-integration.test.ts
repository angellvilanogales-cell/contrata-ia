import { describe, expect, it } from "vitest";
import { LB6Orchestrator } from "../src/application/intake/lb6/LB6Orchestrator";
import { augmentEventServicesPackage } from "../src/application/documents/lb7/EventServicesDocumentAugmenter";
import { composeEventTechnicalOutline } from "../src/application/intake/lb7/EventServicesProfile";
import type { LB5DocumentPackage } from "../src/application/documents/lb5/DocumentModel";

describe("LB-7 specialized workflow integration", () => {
  it("persists EVENT_SERVICES supplements and exposes missing facts in ordinary review", () => {
    const orchestrator = new LB6Orchestrator();
    const created = orchestrator.createCase("GUIDED", "EVT-001");
    const updated = orchestrator.configureEventServices(created.id, ["VENUE", "AUDIOVISUAL"], {
      eventOfficialNames: "Gala institucional",
      eventCount: 1,
      publicPurposeAndNeed: "Celebración del acto institucional.",
      datesOrTimeWindow: "Octubre de 2026",
      locationsAndNuts: "Granada / ES614",
      lots: "Lote único",
      cpvByLotOrPrestacion: "79952000-2"
    });
    expect(updated.lb7?.family).toBe("EVENT_SERVICES");
    expect(updated.revision).toBe(created.revision + 1);
    expect(updated.validation.validated).toBe(false);
    const review = orchestrator.review(created.id);
    expect(review.lb7.eventServices?.readyForDocumentDraft).toBe(false);
    expect(review.warnings.some(item => item.includes("Espacio o sede"))).toBe(true);
  });

  it("places preventive legal findings in the pre-referral gate", () => {
    const orchestrator = new LB6Orchestrator();
    const created = orchestrator.createCase("GUIDED", "LEGAL-001");
    orchestrator.configurePreLegalReview(created.id, {
      contractType: "SUPPLIES",
      usesOfficialRecommendedPcapModel: true,
      needsBasedUnderDa33: true,
      extensionMonths: 12,
      extensionAddsBudget: true,
      estimatedValueIncludesExtensionBudgetAgain: true,
      singleAwardCriterion: true,
      deliveryTimeVariable: true,
      plannedModification: true,
      modificationAllowsNewUnpricedItems: true,
      catalogueOpenEnded: true
    });
    const review = orchestrator.review(created.id);
    expect(review.lb7.preLegalReview?.findings.length).toBeGreaterThanOrEqual(3);
    expect(review.lb7.legalReferralStatus).toBe("REVIEW_REQUIRED");
    expect(review.lb7.legalReferralReady).toBe(false);
    expect(review.lb7.preLegalReview?.canBeTreatedAsLegalOpinion).toBe(false);
  });

  it("marks a configured case ready for human legal referral when preventive review has no findings", () => {
    const orchestrator = new LB6Orchestrator();
    const created = orchestrator.createCase("GUIDED", "LEGAL-OK");
    orchestrator.configurePreLegalReview(created.id, {
      contractType: "SERVICES",
      usesOfficialRecommendedPcapModel: true,
      needsBasedUnderDa33: false,
      singleAwardCriterion: false,
      plannedModification: false,
      modificationAllowsNewUnpricedItems: false,
      catalogueOpenEnded: false
    });
    const review = orchestrator.review(created.id);
    expect(review.lb7.preLegalReview?.findings).toHaveLength(0);
    expect(review.lb7.legalReferralStatus).toBe("READY_FOR_HUMAN_LEGAL_REFERRAL");
    expect(review.lb7.legalReferralReady).toBe(true);
  });

  it("projects validated event facts into Memoria and PPT without adding internal source metadata", () => {
    const outline = composeEventTechnicalOutline(["VENUE"], {
      eventOfficialNames: "Premios de ejemplo",
      eventCount: 1,
      publicPurposeAndNeed: "Finalidad pública aportada por la unidad promotora.",
      datesOrTimeWindow: "15 de octubre de 2026",
      locationsAndNuts: "Granada / ES614",
      lots: "Lote único",
      cpvByLotOrPrestacion: "79952000-2",
      venue: "Sede definida por la unidad promotora",
      expectedAttendance: "250 personas"
    });
    const emptyValidation = { valid: true, errors: [], warnings: [], pendingHumanValidation: [] } as const;
    const base: LB5DocumentPackage = {
      context: {} as LB5DocumentPackage["context"],
      documents: [
        { id: "MEMORIA", kind: "MEMORIA_JUSTIFICATIVA", title: "Memoria", fileBaseName: "memoria", sections: [], sourceIds: [], warnings: [], validation: emptyValidation },
        { id: "PCAP", kind: "PCAP", title: "PCAP", fileBaseName: "pcap", sections: [], sourceIds: [], warnings: [], validation: emptyValidation },
        { id: "PPT", kind: "PPT", title: "PPT", fileBaseName: "ppt", sections: [], sourceIds: [], warnings: [], validation: emptyValidation }
      ],
      globalValidation: emptyValidation,
      coherenceFingerprint: { expedienteId: "EVT" }
    };
    const result = augmentEventServicesPackage(base, outline);
    const memory = result.documents.find(item => item.kind === "MEMORIA_JUSTIFICATIVA")!;
    const ppt = result.documents.find(item => item.kind === "PPT")!;
    expect(memory.sections.some(item => item.id === "CUSTOM:EVENT_MEMORY_1")).toBe(true);
    expect(ppt.sections.some(item => item.id === "CUSTOM:EVENT_PPT_1")).toBe(true);
    expect(ppt.sections.flatMap(item => item.paragraphs).every(item => item.sourceIds.length === 0)).toBe(true);
    expect(result.coherenceFingerprint.specializedFamily).toBe("EVENT_SERVICES");
  });
});
