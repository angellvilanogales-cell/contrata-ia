import { describe, expect, it } from "vitest";
import {
  MAINTENANCE_007_DOCUMENT_CLOSURE_11_9_5,
  MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS,
} from "../src/regression/ServiceRegressionCase007MaintenanceSevilleDocumentClosure";

describe("Paso 11.9.5 - cierre documental mantenimiento", () => {
  it("clasifica el expediente sin cerrar campos no acreditados", () => {
    const c = MAINTENANCE_007_DOCUMENT_CLOSURE_11_9_5;
    expect(c.id).toBe("REG-SERVICE-007");
    expect(c.step).toBe("11.9.5");
    expect(c.status).toBe("DOCUMENTARY_CLOSURE_WITH_OPEN_ITEMS_AND_SOURCE_CONFLICT");
    expect(c.humanValidationRequired).toBe(true);
    expect(c.counts.CONFIRMED).toBeGreaterThan(0);
    expect(c.counts.CONFIRMED_SOURCE_DECLARATION).toBeGreaterThan(0);
    expect(c.counts.PENDING_SOURCE_EVIDENCE).toBeGreaterThan(0);
    expect(c.counts.BLOCKED_SOURCE_CONFLICT).toBe(1);
    expect(Object.values(c.counts).reduce((sum, value) => sum + value, 0)).toBe(MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS.length);
  });

  it("preserva redondeos, campos abiertos y contradicción de lotes", () => {
    const c = MAINTENANCE_007_DOCUMENT_CLOSURE_11_9_5;
    expect(c.sourceRoundingTreatment).toBe("PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT");
    expect(MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "MAINT-CLOSE-ECONOMICS")?.status).toBe("CONFIRMED_SOURCE_DECLARATION");
    expect(MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "MAINT-CLOSE-AWARD")?.status).toBe("PENDING_SOURCE_EVIDENCE");
    expect(MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "MAINT-CLOSE-SOLVENCY")?.status).toBe("PENDING_SOURCE_EVIDENCE");
    expect(MAINTENANCE_007_DOCUMENT_CLOSURE_ITEMS.find((x) => x.id === "MAINT-CLOSE-LOT-LIMIT")?.status).toBe("BLOCKED_SOURCE_CONFLICT");
    expect(c.promotionRule).toBe("NO_PROMOTION_WITHOUT_NEW_PRIMARY_EVIDENCE_AND_HUMAN_VALIDATION");
  });
});
