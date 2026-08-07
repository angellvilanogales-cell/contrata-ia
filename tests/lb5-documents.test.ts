import { describe, expect, it } from "vitest";
import { AdministrativeDocumentRenderer } from "../src/application/documents/lb5/AdministrativeDocumentRenderer";
import { createLB5DemoContext, runLB5Demo } from "../src/application/documents/lb5/LB5Demo";
import { LB5DocumentComposer } from "../src/application/documents/lb5/LB5DocumentComposer";
import { ProcedureDocumentPlanner } from "../src/application/documents/lb5/ProcedureDocumentPlanner";
import { ProceduralDraftFactory } from "../src/application/documents/lb5/ProceduralDraftFactory";
import { SimpleDocumentRequestInterpreter } from "../src/application/documents/lb5/SimpleDocumentRequest";

describe("LB-5 administrative document composer", () => {
  it("generates Memoria, PCAP and PPT as the mandatory core", () => {
    const rendered = runLB5Demo();
    const kinds = rendered.package.documents.map(document => document.kind);
    expect(kinds).toContain("MEMORIA_JUSTIFICATIVA");
    expect(kinds).toContain("PCAP");
    expect(kinds).toContain("PPT");
    expect(rendered.package.globalValidation.valid).toBe(true);
  });

  it("integrates need and insufficiency into the memory without duplicating standalone reports", () => {
    const packageValue = new LB5DocumentComposer().compose(createLB5DemoContext(), {
      needPlacement: "IN_MEMORY",
      insufficiencyPlacement: "IN_MEMORY"
    });
    const memory = packageValue.documents.find(document => document.kind === "MEMORIA_JUSTIFICATIVA");
    expect(memory?.sections.some(section => section.id === "NEED_IDONEITY")).toBe(true);
    expect(memory?.sections.some(section => section.id === "INSUFFICIENCY_MEANS")).toBe(true);
    expect(packageValue.documents.some(document => document.kind === "INFORME_NECESIDAD")).toBe(false);
    expect(packageValue.documents.some(document => document.kind === "INFORME_INSUFICIENCIA_MEDIOS")).toBe(false);
  });

  it("can generate need and insufficiency as separate documents by operator choice", () => {
    const packageValue = new LB5DocumentComposer().compose(createLB5DemoContext(), {
      needPlacement: "STANDALONE",
      insufficiencyPlacement: "STANDALONE"
    });
    const memory = packageValue.documents.find(document => document.kind === "MEMORIA_JUSTIFICATIVA");
    expect(memory?.sections.some(section => section.id === "NEED_IDONEITY")).toBe(false);
    expect(memory?.sections.some(section => section.id === "INSUFFICIENCY_MEANS")).toBe(false);
    expect(packageValue.documents.some(document => document.kind === "INFORME_NECESIDAD")).toBe(true);
    expect(packageValue.documents.some(document => document.kind === "INFORME_INSUFICIENCIA_MEDIOS")).toBe(true);
    expect(packageValue.globalValidation.valid).toBe(true);
  });

  it("interprets a simple request for an additional lots/procedure report using verified blocks", () => {
    const request = new SimpleDocumentRequestInterpreter().interpret(
      "Genera un informe justificativo de no división en lotes y del procedimiento"
    );
    expect(request.blockIds).toContain("LOTS");
    expect(request.blockIds).toContain("PROCEDURE");
    expect(request.blockIds).toContain("LEGAL_TRACEABILITY");
    const packageValue = new LB5DocumentComposer().compose(createLB5DemoContext(), {
      needPlacement: "IN_MEMORY",
      insufficiencyPlacement: "IN_MEMORY",
      customDocuments: [request]
    });
    expect(packageValue.documents.some(document => document.kind === "CUSTOM")).toBe(true);
  });

  it("rejects a vague custom-document instruction instead of inventing content", () => {
    expect(() => new SimpleDocumentRequestInterpreter().interpret("Hazme otro documento útil"))
      .toThrow(/bloque jurídico-documental verificable/);
  });

  it("creates actual OOXML DOCX packages and PDF files for every document", () => {
    const rendered = runLB5Demo();
    expect(rendered.editable.length).toBe(rendered.package.documents.length);
    expect(rendered.pdf.length).toBe(rendered.package.documents.length);
    for (const artifact of rendered.editable) {
      const buffer = Buffer.from(artifact.data);
      expect(buffer.subarray(0, 4).toString("binary")).toBe("PK\u0003\u0004");
      const packageText = buffer.toString("utf8");
      expect(packageText).toContain("[Content_Types].xml");
      expect(packageText).toContain("word/document.xml");
      expect(packageText).toContain("word/styles.xml");
      expect(artifact.fileName.endsWith(".docx")).toBe(true);
    }
    for (const artifact of rendered.pdf) {
      expect(Buffer.from(artifact.data).subarray(0, 8).toString("latin1")).toBe("%PDF-1.4");
      expect(artifact.fileName.endsWith(".pdf")).toBe(true);
    }
  });

  it("keeps all documents tied to a single coherence fingerprint", () => {
    const packageValue = runLB5Demo().package;
    expect(packageValue.coherenceFingerprint.cpv).toBe("90911200-8");
    expect(packageValue.coherenceFingerprint.estimatedValue).toBe(120000);
    expect(packageValue.coherenceFingerprint.procedure).toBe("OPEN_SIMPLIFIED");
  });

  it("refuses to manufacture an insufficiency-of-means justification", () => {
    const context = { ...createLB5DemoContext(), insufficiencyOfMeans: undefined };
    expect(() => new LB5DocumentComposer().compose(context, {
      needPlacement: "IN_MEMORY",
      insufficiencyPlacement: "IN_MEMORY"
    })).toThrow(/insuficiencia de medios/);
  });

  it("marks normative proposals as pending human validation in the generated package", () => {
    const rendered = new AdministrativeDocumentRenderer().render(
      new LB5DocumentComposer().compose(createLB5DemoContext(), {
        needPlacement: "IN_MEMORY",
        insufficiencyPlacement: "IN_MEMORY"
      })
    );
    expect(rendered.package.globalValidation.pendingHumanValidation.length).toBeGreaterThan(0);
    expect(rendered.package.documents.every(document => document.validation.valid)).toBe(true);
  });

  it("plans the full preparation-stage document set without fabricating external evidence", () => {
    const plan = new ProcedureDocumentPlanner().plan(createLB5DemoContext(), {
      needPlacement: "IN_MEMORY",
      insufficiencyPlacement: "IN_MEMORY"
    });
    expect(plan.items.find(item => item.id === "MEMORIA_JUSTIFICATIVA")?.responsibility).toBe("CONTRATA_IA_GENERATES");
    expect(plan.items.find(item => item.id === "PCAP")?.responsibility).toBe("CONTRATA_IA_GENERATES");
    expect(plan.items.find(item => item.id === "PPT")?.responsibility).toBe("CONTRATA_IA_GENERATES");
    expect(plan.items.find(item => item.id === "CERTIFICADO_EXISTENCIA_CREDITO")?.responsibility).toBe("EXTERNAL_SYSTEM_GENERATES");
    expect(plan.items.find(item => item.id === "RESERVA_CREDITO")?.responsibility).toBe("EXTERNAL_SYSTEM_GENERATES");
    expect(plan.items.find(item => item.id === "INFORME_ASESORIA_JURIDICA")?.responsibility).toBe("EXTERNAL_AUTHORITY_OR_CONTROL_BODY");
  });

  it("changes need-report responsibility when the operator chooses standalone placement", () => {
    const planner = new ProcedureDocumentPlanner();
    const integrated = planner.plan(createLB5DemoContext(), {
      needPlacement: "IN_MEMORY",
      insufficiencyPlacement: "IN_MEMORY"
    });
    const standalone = planner.plan(createLB5DemoContext(), {
      needPlacement: "STANDALONE",
      insufficiencyPlacement: "STANDALONE"
    });
    expect(integrated.items.find(item => item.id === "INFORME_NECESIDAD")?.responsibility).toBe("NOT_APPLICABLE");
    expect(standalone.items.find(item => item.id === "INFORME_NECESIDAD")?.responsibility).toBe("CONTRATA_IA_GENERATES");
  });

  it("can draft initiation and legal-request documents from the same verified blocks", () => {
    const factory = new ProceduralDraftFactory();
    const proposal = factory.create("PROPUESTA_INICIO");
    const legalRequest = factory.create("SOLICITUD_INFORME_JURIDICO");
    expect(proposal.blockIds).toContain("NEED_IDONEITY");
    expect(proposal.blockIds).toContain("PROCEDURE");
    expect(legalRequest.blockIds).toContain("ADMINISTRATIVE_REGIME");
    expect(legalRequest.introductoryText).toMatch(/no sustituye ni simula el informe jurídico/i);
  });
});
