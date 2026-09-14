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
    for (const path of ["object", "contractType", "cpvMain", "need", "lots.divisionIntoLots"]) {
      expect(LB107_INITIAL_PROPOSAL_SCRIPT).toContain(`validateEvidence(id,"${path}"`);
    }
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
});
