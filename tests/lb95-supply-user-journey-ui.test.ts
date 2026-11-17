import { describe, expect, it } from "vitest";
import { SUPPLY_USER_JOURNEY_UI } from "../src/interfaces/lb95/SupplyUserJourneyUi";

describe("LB95 Supply user journey UI", () => {
  it("presenta un recorrido administrativo y no una pantalla técnica de activos", () => {
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Contrato de suministro");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Necesidad y objeto");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Economía y duración");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Procedimiento");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Prescripciones");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Ejecución");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Revisión final");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Documentos");
    expect(SUPPLY_USER_JOURNEY_UI).not.toContain("Activos físicos LB94");
    expect(SUPPLY_USER_JOURNEY_UI).not.toContain("Supabase");
    expect(SUPPLY_USER_JOURNEY_UI).not.toContain("SHA-256");
  });

  it("mantiene aceptación humana y no habilita el paquete hasta superar el gate PCAP", () => {
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Validar humanamente");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("La descarga no sustituye la revisión ni la aprobación humana");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("Generar y descargar PCAP + Memoria + PPT");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("id=\"package\" disabled");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("El PCAP oficial se habilitará solo cuando su ámbito y todas las decisiones del Anexo I estén acreditadas");
    expect(SUPPLY_USER_JOURNEY_UI).toContain("$('package').disabled=!(ready&&pg.ready)");
  });
});
