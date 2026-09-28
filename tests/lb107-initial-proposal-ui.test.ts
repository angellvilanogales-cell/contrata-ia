import { describe, expect, it } from "vitest";
import { LB107_INITIAL_PROPOSAL_SCRIPT } from "../src/interfaces/lb103/LB107InitialProposalScript";

describe("LB107 · interfaz del bloque inicial", () => {
  it("analiza antes de registrar y exige una confirmación humana", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("/api/lb107/initial-proposal");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("No son decisiones automáticas");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Confirmar decisiones iniciales");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('root+"/validate"');
  });

  it("registra objeto, tipo, CPV, necesidad y lotes como evidencias separadas", () => {
    for (const path of ["object", "contractType", "cpvMain", "cpvAdditional", "lots.cpvAssignments", "need", "lots.divisionIntoLots"]) {
      expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain(`validateEvidence(id,"${path}"`);
    }
  });

  it("decide los lotes antes del CPV y muestra código y nomenclatura seleccionables por lote", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT.indexOf("<h3>División en lotes</h3>"))
      .toBeLessThan(LB107_INITIAL_PROPOSAL_SCRIPT.indexOf("<h3>CPV sugeridos para selección humana</h3>"));
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Aceptar lotes y sugerir CPV");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("p.lots.suggestedDefinitions");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("puede aceptarla sin escribir o modificarla antes de validarla");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("c.officialDescription");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Por qué puede encajar:");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('type="checkbox" class="lb107CpvChoice"');
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Seleccione al menos un CPV para ");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Los códigos no se introducen manualmente");
  });

  it("conserva la incertidumbre de lotes como aclaración pendiente sin validarla", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('lotRaw==="pending"');
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('pendingClarifications=["lots.divisionIntoLots"]');
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("no se validará ni permitirá generar");
  });

  it("suprime la entrevista anterior tras activar el expediente canónico", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('work.style.display="none"');
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('guided.decisions["common:object"]');
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('guided.decisions["common:cpv"]');
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('guided.decisions["common:lots"]');
  });

  it("ofrece una revisión visible de lotes y CPV conservando la selección", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Revisar lotes y CPV");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain('id="lb107ReviewLotsCpvs"');
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("s.selectedCpvs=selected");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("s.mainCpvKey=mainKey");
  });

  it("no fuerza códigos débiles y ofrece contraste con el vocabulario oficial", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Sin propuesta CPV fiable");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("no forzará una coincidencia por palabras genéricas");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("CELEX:32002R2195");
  });

  it("reanálisis no destructivo conserva la propuesta hasta recibir la nueva", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Edición segura");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("Cancelar y conservar la propuesta anterior");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("var nextProposal=await json");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("No se ha sustituido la propuesta anterior");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).not.toContain("s.proposal=null");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("<h2>Describa qué se necesita</h2>");
  });

  it("autocompleta una motivación editable al elegir lote único", () => {
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("propuesta editable que requiere validación humana");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("d.noLots&&d.noLots.trim()?d.noLots");
    expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain("debe comprobarse, modificarse si procede y validarse expresamente");
  });
});
