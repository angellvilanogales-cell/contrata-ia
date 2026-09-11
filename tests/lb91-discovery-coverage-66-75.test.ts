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

  it("distingue el multicaso histórico de la promoción física posterior acreditada", () => {
    const row = reconcileUniversalDocumentCoverage("SUPPLY", DocumentType.PPT);
    expect(row.independentCases).toBeGreaterThanOrEqual(5);
    expect(row.physicalUniversalGenerationReady).toBe(true);
    expect(row.status).toBe("PRODUCTION_READY");
  });

  it("mantiene PCAP supply físicamente listo cuando existe modelo general editable", () => {
    const row = reconcileUniversalDocumentCoverage("SUPPLY", DocumentType.PCAP);
    expect(row.status).toBe("PRODUCTION_READY");
    expect(row.physicalUniversalGenerationReady).toBe(true);
  });

  it("reconoce el paquete supply físicamente completo tras la promoción LB94 de Memory y PPT", () => {
    const forecast = forecastUniversalPackagePromotion("SUPPLY");
    expect(forecast.packageReady).toBe(true);
    expect(forecast.readyDocuments).toEqual(expect.arrayContaining([
      DocumentType.PCAP,
      DocumentType.MEMORY,
      DocumentType.PPT,
    ]));
    expect(forecast.blockedDocuments).toEqual([]);
    expect(forecast.humanAcceptanceStillRequired).toBe(true);
  });

  it("no declara concesiones documentadas sin fuentes reales suficientes", () => {
    const forecast = forecastUniversalPackagePromotion("CONCESSION");
    expect(forecast.packageReady).toBe(false);
    expect(forecast.blockedDocuments.length).toBe(3);
  });
});
