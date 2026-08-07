import type {
  AdministrativeDocument,
  CustomDocumentRequest,
  DocumentBlockId,
  DocumentParagraph,
  DocumentSection,
  DocumentValidation,
  LB5CompositionOptions,
  LB5DocumentContext,
  LB5DocumentPackage
} from "./DocumentModel";

const LCSP = "LCSP-2017-CONSOLIDADA-2026";
const JA_MODELS = "JA-MODELOS-PCAP";
const USER_PCAP = "JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO";
const SAE_GUIDE = "SAE-GUIA-OPERATIVA-CONTRATACION";

function money(value: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

function p(
  text: string,
  sourceIds: readonly string[],
  validation: DocumentParagraph["validation"] = "PENDING_HUMAN_VALIDATION"
): DocumentParagraph {
  return { text, sourceIds, validation };
}

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export class LB5DocumentComposer {
  public compose(context: LB5DocumentContext, options: LB5CompositionOptions): LB5DocumentPackage {
    this.validateContext(context);
    const blocks = this.buildBlocks(context);
    const documents: AdministrativeDocument[] = [];

    const memoryBlockIds: DocumentBlockId[] = [
      "IDENTIFICATION",
      ...(options.needPlacement === "IN_MEMORY" ? ["NEED_IDONEITY" as const] : []),
      "OBJECT_CPV",
      ...(options.insufficiencyPlacement === "IN_MEMORY" ? ["INSUFFICIENCY_MEANS" as const] : []),
      "LOTS",
      "BUDGET_VALUE",
      "PROCEDURE",
      "SOLVENCY",
      "AWARD_CRITERIA",
      "GUARANTEES",
      "SPECIAL_EXECUTION",
      "SUBROGATION",
      "DATA_PROTECTION",
      "LEGAL_TRACEABILITY"
    ];

    documents.push(this.document(
      "MEMORIA",
      "MEMORIA_JUSTIFICATIVA",
      "MEMORIA JUSTIFICATIVA DEL EXPEDIENTE DE CONTRATACIÓN",
      `memoria-justificativa-${slug(context.expedienteId)}`,
      memoryBlockIds.map(id => blocks.get(id)!),
      context
    ));

    if (options.needPlacement === "STANDALONE" && options.generateNeedReportWhenStandalone !== false) {
      documents.push(this.document(
        "NECESIDAD",
        "INFORME_NECESIDAD",
        "INFORME DE NECESIDAD E IDONEIDAD DE LA CONTRATACIÓN",
        `informe-necesidad-${slug(context.expedienteId)}`,
        [blocks.get("IDENTIFICATION")!, blocks.get("NEED_IDONEITY")!, blocks.get("OBJECT_CPV")!],
        context
      ));
    }

    if (options.insufficiencyPlacement === "STANDALONE" && options.generateInsufficiencyReportWhenStandalone !== false) {
      documents.push(this.document(
        "INSUFICIENCIA",
        "INFORME_INSUFICIENCIA_MEDIOS",
        "INFORME DE INSUFICIENCIA DE MEDIOS",
        `informe-insuficiencia-medios-${slug(context.expedienteId)}`,
        [blocks.get("IDENTIFICATION")!, blocks.get("INSUFFICIENCY_MEANS")!],
        context
      ));
    }

    documents.push(this.document(
      "PCAP",
      "PCAP",
      "PLIEGO DE CLÁUSULAS ADMINISTRATIVAS PARTICULARES",
      `pcap-${slug(context.expedienteId)}`,
      [
        blocks.get("IDENTIFICATION")!,
        blocks.get("ADMINISTRATIVE_REGIME")!,
        blocks.get("OBJECT_CPV")!,
        blocks.get("BUDGET_VALUE")!,
        blocks.get("PROCEDURE")!,
        blocks.get("SOLVENCY")!,
        blocks.get("AWARD_CRITERIA")!,
        blocks.get("GUARANTEES")!,
        blocks.get("SPECIAL_EXECUTION")!,
        blocks.get("SUBROGATION")!,
        blocks.get("DATA_PROTECTION")!,
        blocks.get("LEGAL_TRACEABILITY")!
      ],
      context
    ));

    documents.push(this.document(
      "PPT",
      "PPT",
      "PLIEGO DE PRESCRIPCIONES TÉCNICAS PARTICULARES",
      `ppt-${slug(context.expedienteId)}`,
      [
        blocks.get("IDENTIFICATION")!,
        blocks.get("OBJECT_CPV")!,
        blocks.get("TECHNICAL_SCOPE")!,
        blocks.get("TECHNICAL_EXECUTION")!,
        blocks.get("QUALITY_CONTROL")!,
        blocks.get("SPECIAL_EXECUTION")!,
        blocks.get("DATA_PROTECTION")!
      ],
      context
    ));

    for (const request of options.customDocuments ?? []) {
      documents.push(this.customDocument(request, blocks, context));
    }

    const globalValidation = this.validatePackage(documents, context, options);
    return {
      context,
      documents,
      globalValidation,
      coherenceFingerprint: {
        expedienteId: context.expedienteId,
        object: context.input.object,
        estimatedValue: context.input.estimatedValue,
        cpv: context.normativeDecision.cpv.primary,
        procedure: context.normativeDecision.procedure.procedure,
        sara: context.normativeDecision.procedure.sara,
        durationMonths: context.input.durationMonths
      }
    };
  }

  private validateContext(context: LB5DocumentContext): void {
    const errors: string[] = [];
    if (!context.expedienteId.trim()) errors.push("Falta identificador del expediente.");
    if (!context.contractingAuthority.trim()) errors.push("Falta órgano de contratación.");
    if (!context.promotingUnit.trim()) errors.push("Falta unidad promotora.");
    if (!context.input.object.trim()) errors.push("Falta objeto contractual.");
    if (!context.input.need.trim()) errors.push("Falta necesidad administrativa.");
    if (!context.insufficiencyOfMeans?.trim()) errors.push("En contratos de servicios debe aportarse una justificación concreta de insuficiencia de medios; no se genera automáticamente.");
    if (context.technical.minimumTasks.length === 0) errors.push("El PPT requiere prestaciones/tareas técnicas concretas.");
    if (context.technical.qualityIndicators.length === 0) errors.push("El PPT requiere criterios verificables de calidad/control.");
    if (context.normativeDecision.lots.result === "NO_DIVISION_PROPOSED" && !context.lotsMotivation?.trim()) {
      errors.push("La no división en lotes propuesta exige motivación fáctica concreta en el expediente.");
    }
    if (errors.length > 0) throw new Error(`LB-5 no puede componer documentos con datos insuficientes: ${errors.join(" ")}`);
  }

  private buildBlocks(context: LB5DocumentContext): Map<DocumentBlockId, DocumentSection> {
    const d = context.normativeDecision;
    const procedureLabel = d.procedure.procedure === "OPEN_SIMPLIFIED_ABBREVIATED"
      ? "procedimiento abierto simplificado abreviado"
      : d.procedure.procedure === "OPEN_SIMPLIFIED"
        ? "procedimiento abierto simplificado"
        : "procedimiento abierto";

    const blocks = new Map<DocumentBlockId, DocumentSection>();
    const add = (id: DocumentBlockId, heading: string, paragraphs: readonly DocumentParagraph[]) => {
      blocks.set(id, { id, heading, paragraphs });
    };

    add("IDENTIFICATION", "1. Identificación del expediente", [
      p(`Expediente: ${context.expedienteId}.`, [SAE_GUIDE], "DETERMINED"),
      p(`Órgano de contratación: ${context.contractingAuthority}. Unidad promotora: ${context.promotingUnit}.`, [SAE_GUIDE], "DETERMINED")
    ]);

    add("NEED_IDONEITY", "Necesidad e idoneidad de la contratación", [
      p(`La necesidad administrativa que se pretende satisfacer es la siguiente: ${context.input.need}`, [LCSP], "PENDING_HUMAN_VALIDATION"),
      p(`El objeto proyectado —${context.input.object}— debe ser idóneo y proporcionado para satisfacer la necesidad descrita. La unidad promotora deberá validar que la naturaleza y extensión de la necesidad y la idoneidad del objeto quedan determinadas con precisión en la documentación preparatoria.`, [LCSP], "PENDING_HUMAN_VALIDATION")
    ]);

    add("OBJECT_CPV", "Objeto, clasificación y alcance contractual", [
      p(`El objeto del contrato es: ${context.input.object}`, [LCSP], "DETERMINED"),
      p(`Se propone como CPV principal ${d.cpv.primary}, con ${d.cpv.alternatives.join(", ")} como alternativa específica. La selección definitiva del CPV queda sometida a comprobación de las prestaciones efectivamente incluidas.`, [USER_PCAP], "PENDING_HUMAN_VALIDATION")
    ]);

    add("INSUFFICIENCY_MEANS", "Insuficiencia de medios", [
      p(context.insufficiencyOfMeans!, [LCSP, SAE_GUIDE], "PENDING_HUMAN_VALIDATION"),
      p("La insuficiencia de medios se documenta como justificación propia del contrato de servicios y no debe sustituirse por una fórmula genérica no acreditada por la unidad promotora.", [LCSP], "PENDING_HUMAN_VALIDATION")
    ]);

    const lotsText = d.lots.result === "DIVIDE"
      ? "Se propone la división del contrato en lotes. La configuración concreta de cada lote, su autonomía funcional y las eventuales limitaciones de licitación/adjudicación deberán quedar definidas antes de aprobar los pliegos."
      : d.lots.result === "NO_DIVISION_PROPOSED"
        ? `Se propone no dividir el contrato en lotes por la siguiente circunstancia declarada: ${context.lotsMotivation}. La motivación debe ser validada por el órgano de contratación y responder a los supuestos legalmente admisibles.`
        : "No existen datos suficientes para decidir la división en lotes. Debe realizarse la evaluación prevista en el artículo 99 LCSP antes de aprobar el expediente.";
    add("LOTS", "División en lotes", [p(lotsText, [LCSP, USER_PCAP], "PENDING_HUMAN_VALIDATION")]);

    const vatRate = context.vatRatePercent ?? 21;
    const budget = context.budgetBaseVatIncluded;
    add("BUDGET_VALUE", "Presupuesto base de licitación y valor estimado", [
      p(`El valor estimado informado para el contrato asciende a ${money(context.input.estimatedValue)}, IVA excluido.`, [LCSP], "DETERMINED"),
      p(budget === undefined
        ? `El presupuesto base de licitación no se ha fijado todavía. Debe calcularse y desglosarse de forma adecuada antes de aprobar los pliegos; el tipo de IVA de referencia informado es ${vatRate} %. `
        : `El presupuesto base de licitación informado asciende a ${money(budget)}, IVA incluido (tipo de referencia ${vatRate} %). El desglose de costes debe validarse antes de la aprobación.`, [LCSP], budget === undefined ? "PENDING_HUMAN_VALIDATION" : "PROPOSED")
    ]);

    add("PROCEDURE", "Procedimiento de adjudicación y tramitación", [
      p(`Dentro del caso de uso normativo validado se propone ${procedureLabel}. El valor estimado ${d.procedure.sara ? "alcanza" : "no alcanza"} el umbral de regulación armonizada aplicable al paquete 2026-2027.`, [LCSP], "PENDING_HUMAN_VALIDATION"),
      p(`El plazo mínimo modelado para presentación de proposiciones es ${d.procedure.tenderDeadlineDaysMinimum} ${d.procedure.deadlineUnit === "WORKING_DAYS" ? "días hábiles" : "días"}. No se aplican reducciones que dependan de hechos adicionales no documentados.`, [LCSP], "DETERMINED")
    ]);

    add("SOLVENCY", "Solvencia económica y técnica", [
      p(`Como referencia supletoria del motor normativo, el volumen anual de negocios calculado asciende a ${money(d.solvency.economic.calculatedMinimum)}. La exigencia concreta debe ser proporcional y quedar validada en el PCAP.`, [LCSP, JA_MODELS], "PENDING_HUMAN_VALIDATION"),
      p("Para la solvencia técnica se propone la experiencia en servicios de igual o similar naturaleza de los tres últimos años. El medio y mínimo concretos deben justificarse en atención al objeto.", [LCSP, JA_MODELS], "PENDING_HUMAN_VALIDATION")
    ]);

    add("AWARD_CRITERIA", "Criterios de adjudicación", [
      p("La adjudicación se configurará con arreglo a la mejor relación calidad-precio y, con carácter general, pluralidad de criterios vinculados al objeto. No se generan ponderaciones arbitrarias.", [LCSP, JA_MODELS], "PENDING_HUMAN_VALIDATION"),
      ...(context.awardCriteriaDescription?.length
        ? context.awardCriteriaDescription.map(text => p(text, [LCSP], "PENDING_HUMAN_VALIDATION"))
        : [p("Las ponderaciones, fórmulas y parámetros de calidad permanecen pendientes de definición y validación por la unidad promotora y el órgano de contratación.", [LCSP], "PENDING_HUMAN_VALIDATION")])
    ]);

    add("GUARANTEES", "Garantías", [
      p(d.guarantees.definitive.required
        ? `No se propone garantía provisional con carácter general. La garantía definitiva ordinaria se configura en el ${d.guarantees.definitive.percentOfFinalPriceExVat} % del precio final ofertado, IVA excluido, salvo excepción legalmente motivada.`
        : "En la modalidad simplificada abreviada del artículo 159.6 no se exige garantía definitiva; tampoco se propone garantía provisional con carácter general.", [LCSP], "PENDING_HUMAN_VALIDATION")
    ]);

    add("SPECIAL_EXECUTION", "Condiciones especiales de ejecución", [
      p(d.specialExecutionCondition.proposedText, [LCSP], "PENDING_HUMAN_VALIDATION"),
      p("La condición deberá concretarse en términos verificables y vinculados a la prestación antes de convertirse en cláusula contractual definitiva.", [LCSP], "PENDING_HUMAN_VALIDATION")
    ]);

    const subrogationText = d.subrogation.status === "DISCLOSE_REQUIRED_INFORMATION"
      ? "Se ha declarado aplicable una obligación de subrogación. Debe incorporarse la información laboral necesaria para que las personas licitadoras evalúen exactamente los costes de personal conforme al artículo 130 LCSP."
      : d.subrogation.status === "VERIFY_APPLICABLE_COLLECTIVE_RULES"
        ? "No se conoce todavía si una norma, convenio colectivo o acuerdo de negociación colectiva de eficacia general impone subrogación. Debe verificarse antes de aprobar los pliegos."
        : "Con los hechos declarados no se activa una obligación del artículo 130, sin perjuicio de la comprobación final de la norma o convenio colectivo aplicable.";
    add("SUBROGATION", "Subrogación de personal", [p(subrogationText, [LCSP, USER_PCAP], "PENDING_HUMAN_VALIDATION")]);

    add("DATA_PROTECTION", "Protección de datos", [
      p(d.specialExecutionCondition.dataProtectionConditionRequired
        ? "Se ha declarado cesión de datos personales desde la entidad pública al contratista. El expediente y el PCAP deberán definir la finalidad del tratamiento e incorporar las obligaciones específicas de protección de datos aplicables."
        : "No se ha declarado cesión de datos personales al contratista. Esta circunstancia deberá volver a verificarse al cerrar el PPT y el diseño operativo del servicio.", [LCSP, JA_MODELS], "PENDING_HUMAN_VALIDATION")
    ]);

    add("ADMINISTRATIVE_REGIME", "Régimen jurídico y documentos contractuales", [
      p("El contrato es administrativo de servicios y se rige por la LCSP, su normativa de desarrollo vigente y la normativa autonómica, sectorial, social, laboral, ambiental, de protección de datos y administración electrónica que resulte aplicable.", [LCSP, JA_MODELS], "PENDING_HUMAN_VALIDATION"),
      p("El PCAP, el PPT y los documentos contractuales que se determinen integran el marco contractual. La versión final del PCAP debe contrastarse con el modelo recomendado vigente de la Comisión Consultiva de Contratación Pública de Andalucía correspondiente al procedimiento y financiación aplicables.", [JA_MODELS, USER_PCAP], "PENDING_HUMAN_VALIDATION")
    ]);

    add("TECHNICAL_SCOPE", "Alcance técnico del servicio", [
      p(context.technical.buildingsDescription, [USER_PCAP], "PENDING_HUMAN_VALIDATION"),
      ...context.technical.minimumTasks.map(task => p(task, [USER_PCAP], "PENDING_HUMAN_VALIDATION"))
    ]);

    add("TECHNICAL_EXECUTION", "Organización y ejecución de las prestaciones", [
      p(context.technical.serviceHours ?? "La franja horaria, frecuencia y organización de los trabajos deberán concretarse por la unidad promotora antes de aprobar el PPT.", [USER_PCAP], "PENDING_HUMAN_VALIDATION"),
      ...(context.technical.productsRequirements ?? []).map(text => p(text, [USER_PCAP], "PENDING_HUMAN_VALIDATION"))
    ]);

    add("QUALITY_CONTROL", "Control de calidad y seguimiento", context.technical.qualityIndicators.map(indicator =>
      p(indicator, [USER_PCAP], "PENDING_HUMAN_VALIDATION")
    ));

    add("LEGAL_TRACEABILITY", "Trazabilidad y validación jurídica", d.traces.map(trace =>
      p(`${trace.ruleId}: ${trace.justification}`, trace.sourceIds, trace.validation)
    ));

    return blocks;
  }

  private document(
    id: string,
    kind: AdministrativeDocument["kind"],
    title: string,
    fileBaseName: string,
    sections: readonly DocumentSection[],
    context: LB5DocumentContext
  ): AdministrativeDocument {
    const sourceIds = unique(sections.flatMap(section => section.paragraphs.flatMap(paragraph => paragraph.sourceIds)));
    const validation = this.validateDocument(kind, sections, context);
    return {
      id,
      kind,
      title,
      fileBaseName,
      sections,
      sourceIds,
      warnings: validation.warnings,
      validation
    };
  }

  private customDocument(
    request: CustomDocumentRequest,
    blocks: Map<DocumentBlockId, DocumentSection>,
    context: LB5DocumentContext
  ): AdministrativeDocument {
    if (!request.title.trim()) throw new Error("Un documento adicional requiere título.");
    if (request.blockIds.length === 0) throw new Error(`El documento adicional '${request.title}' debe seleccionar al menos un bloque verificable.`);
    const sections: DocumentSection[] = [];
    if (request.introductoryText?.trim()) {
      sections.push({
        id: `CUSTOM:${slug(request.title)}`,
        heading: "Objeto del documento",
        paragraphs: [p(request.introductoryText, [], "PENDING_HUMAN_VALIDATION")]
      });
    }
    for (const id of request.blockIds) {
      const block = blocks.get(id);
      if (!block) throw new Error(`Bloque documental no disponible: ${id}`);
      sections.push(block);
    }
    return this.document(
      `CUSTOM-${slug(request.title)}`,
      "CUSTOM",
      request.title.toUpperCase(),
      request.fileBaseName ? slug(request.fileBaseName) : `documento-${slug(request.title)}-${slug(context.expedienteId)}`,
      sections,
      context
    );
  }

  private validateDocument(
    kind: AdministrativeDocument["kind"],
    sections: readonly DocumentSection[],
    context: LB5DocumentContext
  ): DocumentValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const pending: string[] = [];
    const ids = new Set(sections.map(section => section.id));

    if (sections.length === 0) errors.push("Documento sin secciones.");
    if (kind === "MEMORIA_JUSTIFICATIVA") {
      for (const required of ["IDENTIFICATION", "OBJECT_CPV", "LOTS", "BUDGET_VALUE", "PROCEDURE", "SOLVENCY", "AWARD_CRITERIA"] as const) {
        if (!ids.has(required)) errors.push(`La memoria carece del bloque ${required}.`);
      }
    }
    if (kind === "PCAP") {
      for (const required of ["ADMINISTRATIVE_REGIME", "OBJECT_CPV", "BUDGET_VALUE", "PROCEDURE", "SOLVENCY", "AWARD_CRITERIA", "GUARANTEES", "SPECIAL_EXECUTION"] as const) {
        if (!ids.has(required)) errors.push(`El PCAP carece del bloque ${required}.`);
      }
      warnings.push("Proyecto PCAP LB-5: debe contrastarse antes de aprobación con el modelo recomendado vigente de la Junta de Andalucía aplicable al procedimiento y financiación concretos.");
    }
    if (kind === "PPT") {
      for (const required of ["OBJECT_CPV", "TECHNICAL_SCOPE", "TECHNICAL_EXECUTION", "QUALITY_CONTROL"] as const) {
        if (!ids.has(required)) errors.push(`El PPT carece del bloque ${required}.`);
      }
    }

    for (const section of sections) {
      if (!section.heading.trim()) errors.push(`Sección ${section.id} sin título.`);
      for (const paragraph of section.paragraphs) {
        if (!paragraph.text.trim()) errors.push(`Sección ${section.id} contiene un párrafo vacío.`);
        if (paragraph.validation === "PENDING_HUMAN_VALIDATION") pending.push(String(section.id));
      }
    }

    if (context.normativeDecision.overallValidation === "PENDING_HUMAN_VALIDATION") {
      warnings.push("El paquete normativo LB-4 contiene decisiones pendientes de validación humana; los documentos se generan como propuestas de trabajo, no como actos aprobados.");
    }

    return { valid: errors.length === 0, errors, warnings, pendingHumanValidation: unique(pending) };
  }

  private validatePackage(
    documents: readonly AdministrativeDocument[],
    context: LB5DocumentContext,
    options: LB5CompositionOptions
  ): DocumentValidation {
    const errors = documents.flatMap(document => document.validation.errors.map(error => `${document.id}: ${error}`));
    const warnings = documents.flatMap(document => document.validation.warnings.map(warning => `${document.id}: ${warning}`));
    const pending = unique(documents.flatMap(document => document.validation.pendingHumanValidation));
    const kinds = documents.map(document => document.kind);

    for (const core of ["MEMORIA_JUSTIFICATIVA", "PCAP", "PPT"] as const) {
      if (!kinds.includes(core)) errors.push(`Falta documento nuclear ${core}.`);
    }
    const memory = documents.find(document => document.kind === "MEMORIA_JUSTIFICATIVA");
    const hasNeedInMemory = memory?.sections.some(section => section.id === "NEED_IDONEITY") ?? false;
    const hasNeedStandalone = kinds.includes("INFORME_NECESIDAD");
    if (options.needPlacement === "IN_MEMORY" && !hasNeedInMemory) errors.push("La necesidad debía integrarse en la Memoria y no aparece.");
    if (options.needPlacement === "IN_MEMORY" && hasNeedStandalone) errors.push("Duplicidad: necesidad integrada en Memoria y además generada como informe autónomo.");
    if (options.needPlacement === "STANDALONE" && options.generateNeedReportWhenStandalone !== false && !hasNeedStandalone) errors.push("Se solicitó Informe de Necesidad autónomo y no se generó.");

    const fingerprintText = JSON.stringify({
      object: context.input.object,
      value: context.input.estimatedValue,
      cpv: context.normativeDecision.cpv.primary,
      procedure: context.normativeDecision.procedure.procedure
    });
    if (!fingerprintText.includes(context.normativeDecision.cpv.primary)) errors.push("Error interno en huella de coherencia CPV.");

    return { valid: errors.length === 0, errors, warnings, pendingHumanValidation: pending };
  }
}
