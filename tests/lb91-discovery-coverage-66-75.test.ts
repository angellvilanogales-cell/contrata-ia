import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { assessDiscoveryCoverage } from "../src/domain/documentModel/UniversalDocumentDiscoveryEngine";
import { reconcileUniversalDocumentCoverage } from "../src/domain/documentModel/UniversalCoverageReconciler";
import { forecastUniversalPackagePromotion } from "../src/application/universal/UniversalPackagePromotionForecast";

describe("LB91.66-75 - descubrimiento y cobertura universal", () => {
  it("reconoce múltiples suministros independientes documentados", () => {
    expect(assessDiscoveryCoverage("SUPPLY", DocumentType.PCAP).independentCases).toBeGreaterThanOrEqual(5);
    expect(assessDiscoveryCoverage("SUPPLY", DocumentType.PPT).independentCases).toBeGreaterThanOrEqual(5);
  });

  it("no confunde multicaso documentado con generación física universal", () => {
    const row = reconcileUniversalDocumentCoverage("SUPPLY", DocumentType.PPT);
    expect(row.independentCases).toBeGreaterThanOrEqual(5);
    expect(row.physicalUniversalGenerationReady).toBe(false);
  });

  it("mantiene PCAP supply físicamente listo cuando existe modelo general editable", () => {
    const row = reconcileUniversalDocumentCoverage("SUPPLY", DocumentType.PCAP);
    expect(row.status).toBe("PRODUCTION_READY");
    expect(row.physicalUniversalGenerationReady).toBe(true);
  });

  it("mantiene bloqueado el paquete supply hasta Memory y PPT generales", () => {
    const forecast = forecastUniversalPackagePromotion("SUPPLY");
    expect(forecast.packageReady).toBe(false);
    expect(forecast.readyDocuments).toContain(DocumentType.PCAP);
    expect(forecast.blockedDocuments).toContain(DocumentType.MEMORY);
    expect(forecast.blockedDocuments).toContain(DocumentType.PPT);
    expect(forecast.humanAcceptanceStillRequired).toBe(true);
  });

  it("no declara concesiones documentadas sin fuentes reales suficientes", () => {
    const forecast = forecastUniversalPackagePromotion("CONCESSION");
    expect(forecast.packageReady).toBe(false);
    expect(forecast.blockedDocuments.length).toBe(3);
  });
});
