export type ContractNature = "SUPPLIES" | "SERVICES" | "UNKNOWN";
export type LotProposal = "SINGLE_LOT" | "MULTIPLE_LOTS" | "PENDING";
export type ProcedureProposal =
  | "OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE"
  | "OPEN_SIMPLIFIED_CANDIDATE"
  | "OPEN_PROCEDURE_REVIEW_REQUIRED"
  | "PENDING";

export interface AdaptiveFlowAnswers {
  readonly needAndPurpose?: string;
  readonly scopeDetail?: string;
  readonly contentResponsibility?: "ADMIN_SUPPLIES_CONTRACTOR_ADAPTS" | "CONTRACTOR_CREATES" | "NOT_APPLICABLE";
  readonly technicalContinuity?: "SAME_CONTRACTOR_PREFERRED" | "SEPARABLE" | "UNKNOWN";
  readonly dominantComponent?: "INITIAL_DEVELOPMENT" | "RECURRENT_SERVICE" | "GOODS" | "BALANCED" | "UNKNOWN";
  readonly initialBudgetExVat?: number;
  readonly initialDurationMonths?: number;
  readonly extensionMonths?: readonly number[];
  readonly initialOneOffCostExVat?: number;
  readonly recurringAnnualCostExVat?: number;
  readonly requiresNonFormulaQualityAssessment?: boolean;
}

export interface LegalGround {
  readonly article: string;
  readonly rule: string;
  readonly source: "LCSP" | "CPV";
  readonly verification: "CURRENT_LAW_REQUIRED";
}

export interface CpvProposal {
  readonly code: string;
  readonly label: string;
  readonly role: "PRIMARY" | "COMPLEMENTARY";
  readonly confidence: "HIGH" | "MEDIUM";
}

export interface EconomicProjection {
  readonly initialBudgetExVat?: number;
  readonly maximumDurationMonths?: number;
  readonly estimatedValueExVat?: number;
  readonly annualProjection?: readonly { readonly period: string; readonly amountExVat: number }[];
  readonly status: "PENDING" | "PROVISIONAL" | "COHERENT" | "INCONSISTENT";
  readonly note: string;
}

export interface AdaptiveFlowDecision {
  readonly contractNature: ContractNature;
  readonly contractNatureReason: string;
  readonly lotProposal: LotProposal;
  readonly lotReason: string;
  readonly cpv: readonly CpvProposal[];
  readonly economics: EconomicProjection;
  readonly procedure: ProcedureProposal;
  readonly procedureReason: string;
  readonly awardCriteriaConstraint: string;
  readonly proposals: readonly string[];
  readonly warnings: readonly string[];
  readonly legalGrounds: readonly LegalGround[];
  readonly nextQuestion: { readonly id: keyof AdaptiveFlowAnswers; readonly label: string; readonly help: string } | null;
}

const normalize = (value: string | undefined): string => (value ?? "").toLocaleLowerCase("es-ES");

function inferNature(answers: AdaptiveFlowAnswers): { nature: ContractNature; reason: string } {
  const text = normalize(`${answers.needAndPurpose ?? ""} ${answers.scopeDetail ?? ""}`);
  const supplySignals = ["ferreter", "material", "suministr", "pieza", "producto", "equipamiento", "mobiliario"];
  const serviceSignals = ["página web", "pagina web", "sitio web", "desarroll", "diseñ", "mantenimiento", "soporte", "servicio", "consultor", "asistencia"];
  const supplyScore = supplySignals.filter(token => text.includes(token)).length;
  const serviceScore = serviceSignals.filter(token => text.includes(token)).length;
  if (supplyScore > serviceScore && supplyScore > 0) return { nature: "SUPPLIES", reason: "La necesidad descrita se centra en la adquisición o entrega de bienes muebles/materiales." };
  if (serviceScore > 0) return { nature: "SERVICES", reason: "La prestación principal descrita consiste en una actividad técnica, de desarrollo, mantenimiento o soporte." };
  return { nature: "UNKNOWN", reason: "Todavía no hay hechos suficientes para clasificar con seguridad la naturaleza del contrato." };
}

function lotDecision(answers: AdaptiveFlowAnswers): { proposal: LotProposal; reason: string } {
  if (answers.technicalContinuity === "SAME_CONTRACTOR_PREFERRED") {
    return {
      proposal: "SINGLE_LOT",
      reason: "Se propone un único lote porque la unidad promotora declara una necesidad de continuidad y coordinación técnica entre la prestación inicial y las posteriores, evitando incompatibilidades y dispersión de responsabilidades. La motivación debe quedar validada por la unidad promotora."
    };
  }
  if (answers.technicalContinuity === "SEPARABLE") {
    return {
      proposal: "MULTIPLE_LOTS",
      reason: "Las prestaciones se han declarado separables; procede estudiar lotes funcionalmente autónomos y justificar su configuración concreta."
    };
  }
  return { proposal: "PENDING", reason: "Debe comprobarse si las prestaciones pueden ejecutarse separadamente sin perjudicar la coordinación o la correcta ejecución." };
}

function cpvDecision(nature: ContractNature, answers: AdaptiveFlowAnswers): readonly CpvProposal[] {
  const text = normalize(`${answers.needAndPurpose ?? ""} ${answers.scopeDetail ?? ""}`);
  if (nature === "SERVICES" && (text.includes("web") || text.includes("sitio"))) {
    return [
      { code: "72413000-8", label: "Servicios de diseño de sitios web WWW", role: "PRIMARY", confidence: "HIGH" },
      { code: "72420000-0", label: "Servicios de desarrollo de Internet", role: "COMPLEMENTARY", confidence: "MEDIUM" },
      { code: "72540000-2", label: "Servicios de actualización informática", role: "COMPLEMENTARY", confidence: "MEDIUM" },
      { code: "72610000-9", label: "Servicios de apoyo informático", role: "COMPLEMENTARY", confidence: "MEDIUM" }
    ];
  }
  if (nature === "SUPPLIES" && text.includes("ferreter")) {
    return [{ code: "44316400-2", label: "Artículos de ferretería", role: "PRIMARY", confidence: "HIGH" }];
  }
  return [];
}

function economics(answers: AdaptiveFlowAnswers): EconomicProjection {
  const initialBudget = answers.initialBudgetExVat;
  const initialMonths = answers.initialDurationMonths;
  const extensions = answers.extensionMonths ?? [];
  const extensionMonths = extensions.reduce((sum, value) => sum + value, 0);
  const maxMonths = initialMonths === undefined ? undefined : initialMonths + extensionMonths;
  const oneOff = answers.initialOneOffCostExVat;
  const annual = answers.recurringAnnualCostExVat;

  if (initialBudget === undefined || initialMonths === undefined) {
    return { initialBudgetExVat: initialBudget, maximumDurationMonths: maxMonths, status: "PENDING", note: "Faltan presupuesto inicial o duración para proyectar el valor estimado." };
  }

  if (oneOff !== undefined && annual !== undefined) {
    const initialRecurring = annual * (initialMonths / 12);
    const calculatedInitial = oneOff + initialRecurring;
    const extensionCost = annual * (extensionMonths / 12);
    const estimatedValue = calculatedInitial + extensionCost;
    const tolerance = Math.max(1, initialBudget * 0.01);
    const coherent = Math.abs(calculatedInitial - initialBudget) <= tolerance;
    const annualProjection: { period: string; amountExVat: number }[] = [];
    if (initialMonths >= 12) {
      annualProjection.push({ period: "Año 1", amountExVat: oneOff + annual });
      const remainingInitialYears = Math.max(0, Math.round(initialMonths / 12) - 1);
      for (let i = 0; i < remainingInitialYears; i += 1) annualProjection.push({ period: `Año ${i + 2}`, amountExVat: annual });
    }
    extensions.forEach((months, index) => annualProjection.push({ period: `Prórroga ${index + 1}`, amountExVat: annual * (months / 12) }));
    return {
      initialBudgetExVat: initialBudget,
      maximumDurationMonths: maxMonths,
      estimatedValueExVat: estimatedValue,
      annualProjection,
      status: coherent ? "COHERENT" : "INCONSISTENT",
      note: coherent
        ? "La hipótesis económica aportada cuadra con el presupuesto inicial y proyecta las prórrogas sin duplicar el coste inicial no recurrente."
        : `La distribución propuesta suma ${calculatedInitial.toFixed(2)} € para el periodo inicial y no coincide con los ${initialBudget.toFixed(2)} € declarados.`
    };
  }

  return {
    initialBudgetExVat: initialBudget,
    maximumDurationMonths: maxMonths,
    status: "PROVISIONAL",
    note: "No se reparte automáticamente el presupuesto: falta distinguir costes iniciales no recurrentes y costes periódicos antes de calcular las prórrogas."
  };
}

function procedureDecision(nature: ContractNature, economic: EconomicProjection, answers: AdaptiveFlowAnswers): { procedure: ProcedureProposal; reason: string; constraint: string } {
  const value = economic.estimatedValueExVat ?? economic.initialBudgetExVat;
  if ((nature === "SUPPLIES" || nature === "SERVICES") && value !== undefined && value < 60000) {
    if (answers.requiresNonFormulaQualityAssessment === true) {
      return {
        procedure: "OPEN_SIMPLIFIED_CANDIDATE",
        reason: "La cuantía permitiría estudiar una tramitación simplificada, pero la necesidad declarada de criterios dependientes de juicio de valor es incompatible con el abierto simplificado abreviado del artículo 159.6.",
        constraint: "No debe cerrarse el procedimiento hasta fijar y validar la ponderación y régimen de los criterios conforme a los artículos 145, 146 y 159 LCSP."
      };
    }
    return {
      procedure: "OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE",
      reason: "Para suministros o servicios con valor estimado inferior a 60.000 € puede proponerse el abierto simplificado abreviado, condicionado a que todos los criterios sean cuantificables mediante fórmulas y a la verificación de los restantes requisitos legales.",
      constraint: "Si se considera imprescindible un criterio sometido a juicio de valor, esta propuesta debe descartarse y reconsiderarse el procedimiento."
    };
  }
  if ((nature === "SUPPLIES" || nature === "SERVICES") && value !== undefined && value < 143000) {
    return {
      procedure: "OPEN_SIMPLIFIED_CANDIDATE",
      reason: "Por cuantía puede estudiarse el procedimiento abierto simplificado, sujeto a las condiciones y límites del artículo 159 LCSP y a la configuración de los criterios de adjudicación.",
      constraint: "La ponderación de criterios automáticos y de juicio de valor debe validarse antes de cerrar el procedimiento."
    };
  }
  if (value !== undefined) {
    return {
      procedure: "OPEN_PROCEDURE_REVIEW_REQUIRED",
      reason: "La cuantía no permite aplicar automáticamente las simplificaciones anteriores; debe determinarse el procedimiento atendiendo al valor estimado, naturaleza, SARA y circunstancias del expediente.",
      constraint: "Se requiere revisión normativa actualizada antes de fijar el procedimiento."
    };
  }
  return { procedure: "PENDING", reason: "Falta el valor estimado para proponer el procedimiento.", constraint: "Los criterios de adjudicación se decidirán después de conocer el procedimiento aplicable." };
}

function nextQuestion(answers: AdaptiveFlowAnswers, nature: ContractNature, lot: LotProposal, economic: EconomicProjection): AdaptiveFlowDecision["nextQuestion"] {
  if (!answers.needAndPurpose?.trim()) return { id: "needAndPurpose", label: "¿Qué necesita contratar la Administración y para qué?", help: "Describa la necesidad con lenguaje natural; no es necesario conocer el tipo jurídico del contrato." };
  if (!answers.scopeDetail?.trim()) return { id: "scopeDetail", label: "¿Qué trabajos, entregas o prestaciones debe realizar la empresa?", help: "Indique las prestaciones principales y las que deban mantenerse durante la ejecución." };
  if (nature === "SERVICES" && answers.contentResponsibility === undefined && normalize(answers.scopeDetail).includes("web")) return { id: "contentResponsibility", label: "¿Quién elaborará los contenidos?", help: "Indique si la Administración aporta la información y la empresa solo la adapta/publica, o si la empresa también crea contenido sustantivo." };
  if (lot === "PENDING") return { id: "technicalContinuity", label: "¿Las distintas prestaciones pueden ejecutarse por empresas diferentes sin problemas de coordinación?", help: "Conteste desde la realidad técnica; el sistema elaborará después la motivación jurídica de lotes." };
  if (answers.dominantComponent === undefined) return { id: "dominantComponent", label: "¿Qué prestación tiene mayor peso económico y funcional?", help: "No hacen falta porcentajes exactos; sirve para identificar prestación principal y CPV." };
  if (answers.initialBudgetExVat === undefined) return { id: "initialBudgetExVat", label: "¿Qué importe máximo aproximado se prevé para el periodo inicial, sin IVA?", help: "Si solo conoce una cifra aproximada, indíquela; después se comprobará su adecuación a mercado." };
  if (answers.initialDurationMonths === undefined) return { id: "initialDurationMonths", label: "¿Cuál será la duración inicial del contrato?", help: "Indique la duración en meses. Las prórrogas se preguntarán a continuación." };
  if (answers.extensionMonths === undefined) return { id: "extensionMonths", label: "¿Qué prórrogas se prevén?", help: "Indique la duración de cada prórroga. Por ejemplo: 12, 12." };
  if (economic.status === "PROVISIONAL") return { id: "initialOneOffCostExVat", label: "¿Puede separar aproximadamente el coste inicial no recurrente del coste periódico?", help: "Si no lo sabe, el sistema debe marcarlo como pendiente de contraste de mercado; no debe inventar el reparto." };
  if (answers.initialOneOffCostExVat !== undefined && answers.recurringAnnualCostExVat === undefined) return { id: "recurringAnnualCostExVat", label: "¿Cuál sería el coste anual aproximado de mantenimiento o prestación recurrente?", help: "Esta cifra permite proyectar las prórrogas sin duplicar el coste inicial." };
  if (answers.requiresNonFormulaQualityAssessment === undefined) return { id: "requiresNonFormulaQualityAssessment", label: "¿Hay alguna característica cualitativa que sea imprescindible valorar y que no pueda medirse con una fórmula objetiva?", help: "No se pregunta por un porcentaje: la respuesta sirve para comprobar la compatibilidad con el procedimiento propuesto y, si procede, abrir la rama de criterios de juicio de valor." };
  return null;
}

export class AdaptiveProcurementFlow {
  public analyze(answers: AdaptiveFlowAnswers): AdaptiveFlowDecision {
    const nature = inferNature(answers);
    const lots = lotDecision(answers);
    const economic = economics(answers);
    const procedure = procedureDecision(nature.nature, economic, answers);
    const cpv = cpvDecision(nature.nature, answers);
    const proposals: string[] = [];
    const warnings: string[] = [];

    if (nature.nature !== "UNKNOWN") proposals.push(`Naturaleza contractual propuesta: ${nature.nature === "SERVICES" ? "servicios" : "suministros"}.`);
    if (lots.proposal === "SINGLE_LOT") proposals.push("Propuesta: lote único, con motivación de coordinación técnica pendiente de validación humana.");
    if (lots.proposal === "MULTIPLE_LOTS") proposals.push("Propuesta: estudiar lotes funcionalmente autónomos y asignar CPV por lote.");
    if (cpv.length) proposals.push(`CPV principal propuesto: ${cpv.find(item => item.role === "PRIMARY")?.code}.`);
    if (economic.estimatedValueExVat !== undefined) proposals.push(`Valor estimado provisional: ${economic.estimatedValueExVat.toFixed(2)} € sin IVA.`);
    if (economic.status === "INCONSISTENT") warnings.push(economic.note);
    if (economic.status === "PROVISIONAL") warnings.push("La distribución económica está pendiente; no se proyectan prórrogas mediante una simple división lineal.");
    if (procedure.procedure !== "PENDING") proposals.push(`Procedimiento propuesto: ${procedure.procedure}.`);

    return {
      contractNature: nature.nature,
      contractNatureReason: nature.reason,
      lotProposal: lots.proposal,
      lotReason: lots.reason,
      cpv,
      economics: economic,
      procedure: procedure.procedure,
      procedureReason: procedure.reason,
      awardCriteriaConstraint: procedure.constraint,
      proposals,
      warnings,
      legalGrounds: [
        { article: nature.nature === "SUPPLIES" ? "LCSP art. 16" : "LCSP art. 17", rule: "Clasificación por la prestación principal descrita.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
        { article: "LCSP arts. 99.3 y 116.4", rule: "La división en lotes debe analizarse y la no división debe motivarse en el expediente.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
        { article: "Reglamento (CE) 2195/2002 y Reglamento (CE) 213/2008", rule: "Clasificación CPV del objeto y, cuando proceda, de cada lote.", source: "CPV", verification: "CURRENT_LAW_REQUIRED" },
        { article: "LCSP art. 101", rule: "El valor estimado se expresa sin IVA e incluye prórrogas, opciones y modificaciones previstas que procedan.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
        { article: "LCSP arts. 145 y 146", rule: "Los criterios deben estar vinculados al objeto y su ponderación y método de valoración deben quedar definidos y justificados.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
        { article: "LCSP art. 159", rule: "La cuantía y la configuración de los criterios condicionan la modalidad simplificada aplicable.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" }
      ],
      nextQuestion: nextQuestion(answers, nature.nature, lots.proposal, economic)
    };
  }
}
