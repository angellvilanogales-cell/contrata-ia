import fs from "node:fs";
import path from "node:path";
import { LB4CleaningServiceEngine } from "../../normative/LB4CleaningServiceEngine";
import { AdministrativeDocumentRenderer } from "./AdministrativeDocumentRenderer";
import { LB5DocumentComposer } from "./LB5DocumentComposer";
import { ProcedureDocumentPlanner } from "./ProcedureDocumentPlanner";
import { ProceduralDraftFactory } from "./ProceduralDraftFactory";
import { SimpleDocumentRequestInterpreter } from "./SimpleDocumentRequest";
import type { LB5CompositionOptions, LB5DocumentContext, LB5RenderedPackage } from "./DocumentModel";

export function createLB5DemoContext(): LB5DocumentContext {
  const input = {
    object: "Servicio de limpieza de edificios y oficinas administrativas del Servicio Andaluz de Empleo",
    need: "Mantener las dependencias administrativas en condiciones adecuadas de higiene, salubridad, seguridad y uso durante su apertura y funcionamiento ordinario.",
    estimatedValue: 120000,
    durationMonths: 24,
    judgmentValuePercent: 20,
    allAwardCriteriaFormulaBased: false,
    lotAssessment: "NO_DIVIDE_TECHNICAL_COORDINATION" as const,
    subrogationObligation: "UNKNOWN" as const,
    publicBodyTransfersPersonalDataToContractor: false
  };
  const normativeDecision = new LB4CleaningServiceEngine().evaluate(input);
  return {
    expedienteId: "CONTR/LB5/0001",
    contractingAuthority: "Servicio Andaluz de Empleo",
    promotingUnit: "Unidad promotora de servicios generales",
    input,
    normativeDecision,
    budgetBaseVatIncluded: 145200,
    vatRatePercent: 21,
    insufficiencyOfMeans: "La unidad promotora declara que no dispone de una plantilla propia suficiente ni de los medios materiales especializados necesarios para ejecutar de forma continuada las prestaciones de limpieza objeto del contrato, por lo que resulta necesaria su contratación externa. Esta declaración deberá ser confirmada por la unidad competente antes de la aprobación del expediente.",
    lotsMotivation: "La unidad promotora declara que la ejecución integrada responde a una necesidad de coordinación técnica de frecuencias, sustituciones, control de incidencias y supervisión común en los centros incluidos. La suficiencia de esta motivación debe validarse expresamente conforme al artículo 99.3 LCSP.",
    technical: {
      buildingsDescription: "El servicio comprende la limpieza ordinaria y periódica de edificios y oficinas administrativas incluidos en el inventario que deberá incorporarse como anexo técnico definitivo, con identificación de superficies, usos y zonas singulares.",
      serviceHours: "La programación definitiva de horarios deberá minimizar interferencias con la atención al público y garantizar la cobertura de incidencias durante la jornada de apertura de los centros.",
      minimumTasks: [
        "Limpieza y desinfección de zonas de trabajo, atención al público, aseos, zonas comunes y elementos de uso frecuente con las frecuencias que se establezcan en el inventario técnico.",
        "Limpieza periódica de cristales, carpinterías, puntos de luz accesibles, paramentos y otros elementos que requieran una frecuencia distinta de la limpieza diaria.",
        "Retirada selectiva de residuos y reposición de consumibles higiénicos cuando se incluya expresamente en el inventario de prestaciones.",
        "Atención de incidencias extraordinarias de limpieza dentro de los tiempos de respuesta que se definan en el PPT definitivo."
      ],
      qualityIndicators: [
        "Registro de incidencias, fecha de detección, actuación correctora y fecha de cierre.",
        "Comprobación periódica del cumplimiento de frecuencias mediante partes de servicio verificables.",
        "Control de no conformidades por centro y seguimiento de su corrección dentro del plazo contractual definido."
      ],
      productsRequirements: [
        "Los productos y consumibles deberán cumplir la normativa sectorial aplicable y las condiciones ambientales que se concreten en el PPT, evitando prescripciones de marca salvo los supuestos legalmente admisibles."
      ]
    },
    sources: [
      {
        id: "LCSP-2017-CONSOLIDADA-2026",
        authority: "BOE",
        title: "Ley 9/2017, de Contratos del Sector Público, texto consolidado",
        locator: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902",
        effectiveContext: "Normativa vigente de referencia del expediente"
      },
      {
        id: "JA-MODELOS-PCAP",
        authority: "Junta de Andalucía - Comisión Consultiva de Contratación Pública",
        title: "Modelos de pliegos y contratos; modelos de servicios recomendados",
        locator: "https://www.juntadeandalucia.es/temas/contratacion-publica/gestion/comision-consultiva/paginas/pliegos.html",
        effectiveContext: "Modelos recomendados con control de actualizaciones publicado en diciembre de 2025"
      },
      {
        id: "JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO",
        authority: "Documentación administrativa aportada al proyecto",
        title: "PCAP y memorias reales de servicios de la Junta de Andalucía",
        locator: "file-library",
        effectiveContext: "Patrón administrativo y contraste; no sustituye a la normativa vigente"
      },
      {
        id: "SAE-GUIA-OPERATIVA-CONTRATACION",
        authority: "Documentación operativa SAE aportada al proyecto",
        title: "Guía Operativa de Tramitación de Expedientes de Contratación",
        locator: "file-library",
        effectiveContext: "Referencia de flujo y composición documental; validar instrucciones internas antes de uso productivo"
      }
    ]
  };
}

export function createLB5DemoOptions(): LB5CompositionOptions {
  const interpreter = new SimpleDocumentRequestInterpreter();
  const procedural = new ProceduralDraftFactory();
  return {
    needPlacement: "IN_MEMORY",
    insufficiencyPlacement: "IN_MEMORY",
    customDocuments: [
      interpreter.interpret("Genera un informe justificativo de la no división en lotes y del procedimiento de adjudicación"),
      procedural.create("PROPUESTA_INICIO"),
      procedural.create("ACUERDO_INICIO")
    ]
  };
}

export function runLB5Demo(): LB5RenderedPackage {
  const context = createLB5DemoContext();
  const packageValue = new LB5DocumentComposer().compose(context, createLB5DemoOptions());
  return new AdministrativeDocumentRenderer().render(packageValue);
}

export function writeLB5DemoArtifacts(outputDirectory: string): LB5RenderedPackage {
  const rendered = runLB5Demo();
  const options = createLB5DemoOptions();
  const procedureDocumentPlan = new ProcedureDocumentPlanner().plan(rendered.package.context, options);
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const artifact of [...rendered.editable, ...rendered.pdf]) {
    fs.writeFileSync(path.join(outputDirectory, artifact.fileName), Buffer.from(artifact.data));
  }
  fs.writeFileSync(
    path.join(outputDirectory, "manifest.json"),
    JSON.stringify({
      expedienteId: rendered.package.context.expedienteId,
      documents: rendered.package.documents.map(document => ({
        id: document.id,
        kind: document.kind,
        title: document.title,
        valid: document.validation.valid,
        pendingHumanValidation: document.validation.pendingHumanValidation
      })),
      procedureDocumentPlan,
      coherenceFingerprint: rendered.package.coherenceFingerprint,
      globalValidation: rendered.package.globalValidation
    }, null, 2),
    "utf8"
  );
  return rendered;
}
