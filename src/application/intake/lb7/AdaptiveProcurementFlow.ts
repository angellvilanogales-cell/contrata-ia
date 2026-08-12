export type ContractNature = "SUPPLIES" | "SERVICES" | "WORKS" | "UNKNOWN";
export type LotProposal = "SINGLE_LOT" | "MULTIPLE_LOTS" | "PENDING";
export type ProcedureProposal = "OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE" | "OPEN_SIMPLIFIED_CANDIDATE" | "OPEN_PROCEDURE_REVIEW_REQUIRED" | "PENDING";

export interface AdaptiveFlowAnswers {
  readonly needAndPurpose?: string;
  readonly scopeDetail?: string;
  readonly technicalContinuity?: "SAME_CONTRACTOR_PREFERRED" | "SEPARABLE" | "UNKNOWN";

  readonly contentResponsibility?: "ADMIN_SUPPLIES_CONTRACTOR_ADAPTS" | "CONTRACTOR_CREATES" | "NOT_APPLICABLE";
  readonly dominantComponent?: "INITIAL_DEVELOPMENT" | "RECURRENT_SERVICE" | "GOODS" | "BALANCED" | "UNKNOWN";
  readonly serviceMeansAvailability?: "INSUFFICIENT" | "AVAILABLE" | "UNKNOWN";
  readonly serviceDataHandling?: "NONE" | "ACCESS" | "PROCESSING";
  readonly serviceEconomicPattern?: "ONE_OFF_PLUS_RECURRING" | "RECURRENT" | "SINGLE_RESULT";

  readonly supplyAcquisitionMode?: "SUCCESSIVE_NEEDS" | "CLOSED_QUANTITIES";
  readonly supplyExtensionBudgetsExVat?: readonly number[];

  readonly worksProjectStatus?: "APPROVED" | "DRAFT_EXISTS" | "NEEDS_DRAFTING";
  readonly worksLandAvailability?: "AVAILABLE" | "PENDING" | "NOT_APPLICABLE";
  readonly worksSafetyDocument?: "STUDY" | "BASIC_STUDY" | "PENDING";
  readonly worksPriceReviewExpected?: boolean;

  readonly initialBudgetExVat?: number;
  readonly initialDurationMonths?: number;
  readonly extensionMonths?: readonly number[];
  readonly initialOneOffCostExVat?: number;
  readonly recurringAnnualCostExVat?: number;
  readonly economicCorrectionTarget?: "INITIAL" | "RECURRING";
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
  const value = normalize(`${answers.needAndPurpose ?? ""} ${answers.scopeDetail ?? ""}`);
  const worksScore = ["obra", "reforma", "rehabilitación", "rehabilitacion", "construcción", "construccion", "demolición", "demolicion", "remodelación", "remodelacion"].filter(token => value.includes(token)).length;
  const supplyScore = ["ferreter", "material", "suministr", "pieza", "producto", "equipamiento", "mobiliario", "artículo", "articulo"].filter(token => value.includes(token)).length;
  const serviceScore = ["página web", "pagina web", "sitio web", "desarroll", "diseñ", "mantenimiento", "soporte", "servicio", "consultor", "asistencia", "formación", "formacion"].filter(token => value.includes(token)).length;
  if (worksScore > supplyScore && worksScore > serviceScore && worksScore > 0) return { nature: "WORKS", reason: "La necesidad descrita se dirige a ejecutar una obra sobre un inmueble o infraestructura, con un resultado material definido." };
  if (supplyScore > serviceScore && supplyScore > 0) return { nature: "SUPPLIES", reason: "La necesidad descrita se centra en la adquisición o entrega de bienes muebles, materiales o artículos." };
  if (serviceScore > 0) return { nature: "SERVICES", reason: "La prestación principal descrita consiste en una actividad o resultado distinto de una obra o suministro." };
  return { nature: "UNKNOWN", reason: "Todavía no hay hechos suficientes para clasificar con seguridad la naturaleza del contrato." };
}

function lotDecision(answers: AdaptiveFlowAnswers, nature: ContractNature): { proposal: LotProposal; reason: string } {
  if (answers.technicalContinuity === "SAME_CONTRACTOR_PREFERRED") {
    if (nature === "SUPPLIES") return { proposal: "SINGLE_LOT", reason: "Se propone un único lote porque la unidad promotora aprecia que la gestión conjunta de referencias, pedidos y entregas responde mejor a la necesidad. La motivación concreta debe validarse y trasladarse al expediente." };
    if (nature === "WORKS") return { proposal: "SINGLE_LOT", reason: "Se propone un único lote por la necesidad declarada de coordinación técnica, secuencia constructiva y responsabilidad unitaria sobre la ejecución. La motivación debe validarse en el expediente." };
    return { proposal: "SINGLE_LOT", reason: "Se propone un único lote porque la unidad promotora declara una necesidad de continuidad y coordinación técnica entre las prestaciones. Esta motivación debe ser validada y trasladada al expediente." };
  }
  if (answers.technicalContinuity === "SEPARABLE") {
    if (nature === "SUPPLIES") return { proposal: "MULTIPLE_LOTS", reason: "Los grupos de artículos se han declarado separables; procede estudiar lotes funcionalmente autónomos y justificar su configuración concreta." };
    if (nature === "WORKS") return { proposal: "MULTIPLE_LOTS", reason: "Se han identificado partes de la obra susceptibles de ejecución independiente; procede estudiar lotes compatibles con el proyecto, la coordinación y la seguridad de la obra." };
    return { proposal: "MULTIPLE_LOTS", reason: "Las prestaciones se han declarado separables; procede estudiar lotes funcionalmente autónomos y justificar su configuración concreta." };
  }
  const reason = nature === "SUPPLIES"
    ? "Debe comprobarse si existen familias de artículos que puedan adjudicarse y suministrarse de forma independiente."
    : nature === "WORKS"
      ? "Debe comprobarse si el proyecto admite partes funcionalmente autónomas sin comprometer la coordinación, la seguridad o la correcta ejecución."
      : "Debe comprobarse si las prestaciones pueden ejecutarse separadamente sin perjudicar la coordinación o la correcta ejecución.";
  return { proposal: "PENDING", reason };
}

function cpvDecision(nature: ContractNature, answers: AdaptiveFlowAnswers): readonly CpvProposal[] {
  const value = normalize(`${answers.needAndPurpose ?? ""} ${answers.scopeDetail ?? ""}`);
  if (nature === "SERVICES" && (value.includes("web") || value.includes("sitio"))) return [
    { code: "72413000-8", label: "Servicios de diseño de sitios web WWW", role: "PRIMARY", confidence: "HIGH" },
    { code: "72420000-0", label: "Servicios de desarrollo de Internet", role: "COMPLEMENTARY", confidence: "MEDIUM" },
    { code: "72540000-2", label: "Servicios de actualización informática", role: "COMPLEMENTARY", confidence: "MEDIUM" },
    { code: "72610000-9", label: "Servicios de apoyo informático", role: "COMPLEMENTARY", confidence: "MEDIUM" }
  ];
  if (nature === "SUPPLIES" && value.includes("ferreter")) return [{ code: "44316400-2", label: "Artículos de ferretería", role: "PRIMARY", confidence: "HIGH" }];
  return [];
}

function serviceEconomics(answers: AdaptiveFlowAnswers): EconomicProjection {
  const initialBudget = answers.initialBudgetExVat;
  const initialMonths = answers.initialDurationMonths;
  const extensions = answers.extensionMonths ?? [];
  const extensionMonths = extensions.reduce((sum, months) => sum + months, 0);
  const maximumDurationMonths = initialMonths === undefined ? undefined : initialMonths + extensionMonths;
  if (initialBudget === undefined || initialMonths === undefined) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PENDING", note: "Faltan presupuesto inicial o duración para proyectar el valor estimado." };
  if (answers.serviceEconomicPattern === undefined) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PROVISIONAL", note: "Debe identificarse cómo se forma económicamente la prestación: resultado único, servicio recurrente o combinación de coste inicial y coste periódico." };

  if (answers.serviceEconomicPattern === "ONE_OFF_PLUS_RECURRING") {
    const oneOff = answers.initialOneOffCostExVat;
    const annual = answers.recurringAnnualCostExVat;
    if (oneOff === undefined || annual === undefined) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PROVISIONAL", note: "Falta separar el coste inicial no recurrente del coste periódico." };
    const initialRecurring = annual * (initialMonths / 12);
    const calculatedInitial = oneOff + initialRecurring;
    const extensionCost = annual * (extensionMonths / 12);
    const estimatedValue = calculatedInitial + extensionCost;
    const coherent = Math.abs(calculatedInitial - initialBudget) <= Math.max(1, initialBudget * 0.01);
    const projection: { period: string; amountExVat: number }[] = [];
    const wholeYears = Math.floor(initialMonths / 12);
    if (wholeYears > 0) {
      projection.push({ period: "Año 1", amountExVat: oneOff + annual });
      for (let year = 2; year <= wholeYears; year += 1) projection.push({ period: `Año ${year}`, amountExVat: annual });
      const remainder = initialMonths - wholeYears * 12;
      if (remainder > 0) projection.push({ period: `Periodo inicial adicional (${remainder} meses)`, amountExVat: annual * (remainder / 12) });
    } else projection.push({ period: `Periodo inicial (${initialMonths} meses)`, amountExVat: oneOff + annual * (initialMonths / 12) });
    extensions.forEach((months, index) => projection.push({ period: `Prórroga ${index + 1} (${months} meses)`, amountExVat: annual * (months / 12) }));
    return { initialBudgetExVat: initialBudget, maximumDurationMonths, estimatedValueExVat: estimatedValue, annualProjection: projection, status: coherent ? "COHERENT" : "INCONSISTENT", note: coherent ? "La hipótesis económica cuadra con el presupuesto inicial y permite proyectar las prórrogas sin repetir el coste inicial no recurrente." : `La distribución propuesta suma ${calculatedInitial.toFixed(2)} € para el periodo inicial y no coincide con los ${initialBudget.toFixed(2)} € declarados.` };
  }

  if (answers.serviceEconomicPattern === "RECURRENT") {
    const annual = answers.recurringAnnualCostExVat;
    if (annual === undefined) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PROVISIONAL", note: "Falta indicar el coste anual aproximado de la prestación recurrente." };
    const calculatedInitial = annual * (initialMonths / 12);
    const estimatedValue = calculatedInitial + annual * (extensionMonths / 12);
    const coherent = Math.abs(calculatedInitial - initialBudget) <= Math.max(1, initialBudget * 0.01);
    const projection = [{ period: `Periodo inicial (${initialMonths} meses)`, amountExVat: calculatedInitial }, ...extensions.map((months, index) => ({ period: `Prórroga ${index + 1} (${months} meses)`, amountExVat: annual * (months / 12) }))];
    return { initialBudgetExVat: initialBudget, maximumDurationMonths, estimatedValueExVat: estimatedValue, annualProjection: projection, status: coherent ? "COHERENT" : "INCONSISTENT", note: coherent ? "El coste recurrente declarado cuadra con el presupuesto del periodo inicial." : "El coste recurrente declarado no coincide con el presupuesto del periodo inicial y debe revisarse." };
  }

  if (extensions.length > 0) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PROVISIONAL", note: "La prestación se ha definido como resultado único, pero existen prórrogas previstas. Debe concretarse el importe que correspondería a esas prórrogas antes de fijar el valor estimado." };
  return { initialBudgetExVat: initialBudget, maximumDurationMonths, estimatedValueExVat: initialBudget, annualProjection: [{ period: `Periodo de ejecución (${initialMonths} meses)`, amountExVat: initialBudget }], status: "COHERENT", note: "La prestación se configura como un resultado único sin prórrogas económicas adicionales." };
}

function supplyEconomics(answers: AdaptiveFlowAnswers): EconomicProjection {
  const initialBudget = answers.initialBudgetExVat;
  const initialMonths = answers.initialDurationMonths;
  const extensions = answers.extensionMonths ?? [];
  const maximumDurationMonths = initialMonths === undefined ? undefined : initialMonths + extensions.reduce((sum, months) => sum + months, 0);
  if (initialBudget === undefined || initialMonths === undefined) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PENDING", note: "Faltan presupuesto inicial o duración para cerrar la proyección económica del suministro." };
  if (answers.supplyAcquisitionMode === undefined) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PROVISIONAL", note: "Debe indicarse si el suministro responde a cantidades cerradas o a pedidos sucesivos según necesidades." };
  const extensionBudgets = answers.supplyExtensionBudgetsExVat;
  if (extensions.length > 0 && (extensionBudgets === undefined || extensionBudgets.length !== extensions.length)) return { initialBudgetExVat: initialBudget, maximumDurationMonths, status: "PROVISIONAL", note: "No se extrapolan las prórrogas por división lineal: deben indicarse expresamente los importes máximos previstos para cada prórroga." };
  const projection: { period: string; amountExVat: number }[] = [{ period: `Periodo inicial (${initialMonths} meses)`, amountExVat: initialBudget }];
  extensions.forEach((months, index) => projection.push({ period: `Prórroga ${index + 1} (${months} meses)`, amountExVat: extensionBudgets?.[index] ?? 0 }));
  const estimatedValue = initialBudget + (extensionBudgets ?? []).reduce((sum, value) => sum + value, 0);
  return { initialBudgetExVat: initialBudget, maximumDurationMonths, estimatedValueExVat: estimatedValue, annualProjection: projection, status: "COHERENT", note: answers.supplyAcquisitionMode === "SUCCESSIVE_NEEDS" ? "El suministro se configura mediante pedidos sucesivos según necesidades. Las cantidades de artículos son estimativas y el valor estimado se apoya en los importes máximos declarados para cada periodo." : "El suministro se configura con cantidades cerradas o previamente definidas. El valor estimado incorpora únicamente los importes expresamente declarados." };
}

function worksEconomics(answers: AdaptiveFlowAnswers): EconomicProjection {
  const budget = answers.initialBudgetExVat;
  const months = answers.initialDurationMonths;
  if (budget === undefined || months === undefined) return { initialBudgetExVat: budget, maximumDurationMonths: months, status: "PENDING", note: "Faltan presupuesto de obra o plazo de ejecución para completar la configuración económica básica." };
  return { initialBudgetExVat: budget, maximumDurationMonths: months, estimatedValueExVat: budget, annualProjection: [{ period: `Plazo de ejecución (${months} meses)`, amountExVat: budget }], status: "COHERENT", note: "Para esta primera configuración el valor estimado toma el importe de la obra sin IVA. Antes de cerrar el expediente deben incorporarse, cuando proceda, suministros puestos a disposición del contratista, modificaciones previstas y demás conceptos del artículo 101 LCSP." };
}

function economics(nature: ContractNature, answers: AdaptiveFlowAnswers): EconomicProjection {
  if (nature === "SUPPLIES") return supplyEconomics(answers);
  if (nature === "WORKS") return worksEconomics(answers);
  return serviceEconomics(answers);
}

function procedureDecision(nature: ContractNature, economic: EconomicProjection, answers: AdaptiveFlowAnswers): { procedure: ProcedureProposal; reason: string; constraint: string } {
  if (economic.status !== "COHERENT" || economic.estimatedValueExVat === undefined) return { procedure: "PENDING", reason: economic.status === "INCONSISTENT" ? "La configuración económica debe corregirse antes de proponer el procedimiento." : "Falta cerrar el valor estimado para proponer el procedimiento.", constraint: "Los criterios de adjudicación se decidirán después de disponer de un valor estimado coherente y determinar el procedimiento aplicable." };
  const value = economic.estimatedValueExVat;
  const abbreviatedLimit = nature === "WORKS" ? 80000 : 60000;
  if (nature !== "UNKNOWN" && value < abbreviatedLimit) {
    if (answers.requiresNonFormulaQualityAssessment === true) return { procedure: "OPEN_SIMPLIFIED_CANDIDATE", reason: "La cuantía permite estudiar la tramitación simplificada, pero la necesidad de criterios dependientes de juicio de valor impide utilizar el abierto simplificado abreviado del artículo 159.6.", constraint: "Debe definirse y validar la ponderación de los criterios conforme a los artículos 145, 146 y 159 LCSP antes de cerrar el procedimiento." };
    return { procedure: "OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE", reason: `Por valor estimado puede estudiarse el procedimiento abierto simplificado abreviado, cuyo umbral es inferior a ${abbreviatedLimit.toLocaleString("es-ES")} € para este tipo contractual, condicionado a que todos los criterios sean cuantificables mediante fórmulas y a los restantes requisitos del artículo 159.6 LCSP.`, constraint: "Si resulta imprescindible un criterio sometido a juicio de valor, esta propuesta debe descartarse y reconsiderarse el procedimiento." };
  }
  if (nature === "WORKS" && value <= 2000000) return { procedure: "OPEN_SIMPLIFIED_CANDIDATE", reason: "Por cuantía puede estudiarse el procedimiento abierto simplificado para obras, sujeto al artículo 159 LCSP y a la configuración de los criterios de adjudicación.", constraint: "La ponderación de criterios automáticos y, en su caso, de juicio de valor debe validarse antes de cerrar el procedimiento." };
  if ((nature === "SUPPLIES" || nature === "SERVICES") && value < 140000) return { procedure: "OPEN_SIMPLIFIED_CANDIDATE", reason: "Por cuantía puede estudiarse el procedimiento abierto simplificado. Para 2026 el artículo 159.1 remite en suministros y servicios al umbral actualizado de 140.000 € de los artículos 21.1.a) y 22.1.a) LCSP.", constraint: "La ponderación de criterios automáticos y de juicio de valor debe validarse antes de cerrar el procedimiento." };
  return { procedure: "OPEN_PROCEDURE_REVIEW_REQUIRED", reason: "La cuantía exige determinar el procedimiento atendiendo al valor estimado, naturaleza del contrato, eventual regulación armonizada y demás circunstancias del expediente.", constraint: "Se requiere verificación normativa actualizada antes de fijar definitivamente el procedimiento." };
}

function nextQuestion(answers: AdaptiveFlowAnswers, nature: ContractNature, lot: LotProposal, economic: EconomicProjection): AdaptiveFlowDecision["nextQuestion"] {
  if (!answers.needAndPurpose?.trim()) return { id: "needAndPurpose", label: "¿Qué necesita contratar la Administración y para qué?", help: "Describa la necesidad con lenguaje natural; no es necesario conocer el tipo jurídico del contrato." };
  if (!answers.scopeDetail?.trim()) return { id: "scopeDetail", label: nature === "SUPPLIES" ? "¿Qué materiales, artículos o familias de productos debe suministrar la empresa?" : nature === "WORKS" ? "¿Qué actuación material debe ejecutarse y sobre qué inmueble o infraestructura?" : "¿Qué trabajos, entregas o prestaciones debe realizar la empresa?", help: nature === "SUPPLIES" ? "Describa las familias principales; la relación detallada podrá importarse mediante la tabla de artículos." : "Concrete el alcance real de la prestación para que el sistema pueda abrir únicamente las ramas necesarias." };
  if (lot === "PENDING") return { id: "technicalContinuity", label: nature === "SUPPLIES" ? "¿Las familias de artículos pueden adjudicarse por separado sin perjudicar la gestión de pedidos y entregas?" : nature === "WORKS" ? "¿Existen partes de la obra que puedan ejecutarse de forma independiente sin perjudicar la coordinación, la seguridad o el resultado final?" : "¿Las distintas prestaciones pueden ejecutarse por empresas diferentes sin problemas relevantes de coordinación?", help: "Conteste desde la realidad técnica. El sistema propondrá después la motivación jurídica de la decisión sobre lotes." };

  if (nature === "SERVICES") {
    if (answers.serviceMeansAvailability === undefined) return { id: "serviceMeansAvailability", label: "¿Dispone la Administración de medios propios suficientes para realizar esta prestación?", help: "En contratos de servicios debe justificarse la insuficiencia de medios cuando proceda. Si no lo sabe todavía, puede indicarlo y quedará pendiente de comprobación." };
    if (normalize(`${answers.needAndPurpose} ${answers.scopeDetail}`).includes("web") && answers.contentResponsibility === undefined) return { id: "contentResponsibility", label: "¿Quién elaborará los contenidos?", help: "Indique si la Administración aporta la información y la empresa solo la adapta y publica, o si la empresa también crea contenido sustantivo." };
    if (answers.serviceDataHandling === undefined) return { id: "serviceDataHandling", label: "¿La empresa tendrá acceso o tratará datos personales durante la ejecución?", help: "Esta respuesta abre, cuando proceda, las cláusulas de protección de datos, seguridad y ubicación de sistemas." };
    if (answers.initialBudgetExVat === undefined) return { id: "initialBudgetExVat", label: "¿Qué importe máximo se prevé para el periodo inicial, sin IVA?", help: "Si la cifra es aproximada, se marcará para contraste de mercado antes de cerrar el expediente." };
    if (answers.initialDurationMonths === undefined) return { id: "initialDurationMonths", label: "¿Cuál será la duración inicial del contrato?", help: "Indique la duración en meses." };
    if (answers.extensionMonths === undefined) return { id: "extensionMonths", label: "¿Qué prórrogas se prevén?", help: "Indique la duración de cada prórroga en meses. Si no hay prórrogas, deje una respuesta equivalente a ninguna." };
    if (answers.serviceEconomicPattern === undefined) return { id: "serviceEconomicPattern", label: "¿Cómo se forma principalmente el precio de la prestación?", help: "Seleccione si existe un coste inicial más mantenimiento, un servicio recurrente o un resultado único. Esta decisión evita aplicar repartos económicos artificiales." };
    if (answers.serviceEconomicPattern === "ONE_OFF_PLUS_RECURRING" && answers.initialOneOffCostExVat === undefined) return { id: "initialOneOffCostExVat", label: "¿Qué parte aproximada corresponde al coste inicial no recurrente?", help: "Por ejemplo, diseño, desarrollo, implantación o puesta en marcha." };
    if ((answers.serviceEconomicPattern === "ONE_OFF_PLUS_RECURRING" || answers.serviceEconomicPattern === "RECURRENT") && answers.recurringAnnualCostExVat === undefined) return { id: "recurringAnnualCostExVat", label: "¿Cuál sería el coste anual aproximado de la prestación recurrente?", help: "Esta cifra permite comprobar el periodo inicial y proyectar las prórrogas sin repetir costes no recurrentes." };
    if (economic.status === "INCONSISTENT" && answers.economicCorrectionTarget === undefined) return { id: "economicCorrectionTarget", label: "La distribución económica no coincide con el presupuesto inicial. ¿Qué dato quiere revisar?", help: "Puede corregir el coste inicial o el coste recurrente; el sistema no decidirá por usted cuál era erróneo." };
    if (economic.status === "INCONSISTENT" && answers.economicCorrectionTarget === "INITIAL") return { id: "initialOneOffCostExVat", label: "Revise el coste inicial no recurrente", help: "Introduzca la cifra corregida." };
    if (economic.status === "INCONSISTENT" && answers.economicCorrectionTarget === "RECURRING") return { id: "recurringAnnualCostExVat", label: "Revise el coste anual recurrente", help: "Introduzca la cifra anual corregida." };
  }

  if (nature === "SUPPLIES") {
    if (answers.supplyAcquisitionMode === undefined) return { id: "supplyAcquisitionMode", label: "¿Cómo se prevé adquirir los artículos durante el contrato?", help: "Indique si habrá pedidos sucesivos según necesidades o cantidades cerradas previamente definidas. La relación de artículos puede gestionarse mediante la plantilla para Excel." };
    if (answers.initialBudgetExVat === undefined) return { id: "initialBudgetExVat", label: "¿Cuál es el presupuesto máximo previsto para el periodo inicial, sin IVA?", help: answers.supplyAcquisitionMode === "SUCCESSIVE_NEEDS" ? "En suministros por necesidades, este importe funciona como límite máximo del periodo declarado; las cantidades de la tabla son estimativas salvo que se establezca otra cosa." : "El importe debe ser coherente con las cantidades y precios unitarios de la relación de artículos." };
    if (answers.initialDurationMonths === undefined) return { id: "initialDurationMonths", label: "¿Cuál será la duración inicial del suministro?", help: "Indique la duración en meses." };
    if (answers.extensionMonths === undefined) return { id: "extensionMonths", label: "¿Se prevén prórrogas?", help: "Indique la duración de cada prórroga en meses. No se proyectará su importe mediante una división automática del presupuesto inicial." };
    if ((answers.extensionMonths?.length ?? 0) > 0 && (answers.supplyExtensionBudgetsExVat === undefined || answers.supplyExtensionBudgetsExVat.length !== answers.extensionMonths?.length)) return { id: "supplyExtensionBudgetsExVat", label: "¿Qué importe máximo sin IVA se prevé para cada prórroga?", help: "Introduzca una cifra por cada prórroga, en el mismo orden. Así el valor estimado no se calcula mediante una extrapolación arbitraria." };
  }

  if (nature === "WORKS") {
    if (answers.worksProjectStatus === undefined) return { id: "worksProjectStatus", label: "¿Existe ya proyecto de obra y en qué estado se encuentra?", help: "Indique si el proyecto está aprobado, existe un borrador pendiente o todavía debe redactarse. Esta respuesta condiciona la preparación del expediente de obras." };
    if (answers.worksProjectStatus !== "NEEDS_DRAFTING" && answers.worksLandAvailability === undefined) return { id: "worksLandAvailability", label: "¿Está disponible el inmueble, terreno o espacio necesario para ejecutar la obra?", help: "La disponibilidad material y jurídica debe comprobarse antes de licitar la ejecución cuando resulte exigible." };
    if (answers.initialBudgetExVat === undefined) return { id: "initialBudgetExVat", label: "¿Cuál es el presupuesto de ejecución previsto para la obra, sin IVA?", help: "Debe ser coherente con el proyecto, mediciones y presupuesto aprobado." };
    if (answers.initialDurationMonths === undefined) return { id: "initialDurationMonths", label: "¿Cuál es el plazo de ejecución previsto para la obra?", help: "Indique el plazo en meses conforme al proyecto y programa de trabajo previsto." };
    if (answers.worksSafetyDocument === undefined) return { id: "worksSafetyDocument", label: "¿El proyecto incorpora estudio de seguridad y salud, estudio básico o está pendiente de determinar?", help: "El sistema utilizará esta respuesta para las actuaciones previas al inicio de las obras y el plan de seguridad y salud." };
    if (answers.worksPriceReviewExpected === undefined) return { id: "worksPriceReviewExpected", label: "¿Se prevé que pueda proceder revisión de precios durante la ejecución?", help: "La respuesta no activa automáticamente una fórmula: servirá para comprobar los requisitos del artículo 103 LCSP y, cuando proceda, la fórmula aplicable." };
  }

  if (nature !== "UNKNOWN" && answers.requiresNonFormulaQualityAssessment === undefined) return { id: "requiresNonFormulaQualityAssessment", label: "¿Existe alguna característica cualitativa imprescindible que no pueda medirse mediante una fórmula objetiva?", help: "No se pregunta todavía por un porcentaje. La respuesta sirve para comprobar la compatibilidad con el procedimiento y abrir, si procede, la rama de criterios sometidos a juicio de valor." };
  return null;
}

function procedureLabel(procedure: ProcedureProposal): string {
  if (procedure === "OPEN_SIMPLIFIED_ABBREVIATED_CANDIDATE") return "procedimiento abierto simplificado abreviado";
  if (procedure === "OPEN_SIMPLIFIED_CANDIDATE") return "procedimiento abierto simplificado";
  if (procedure === "OPEN_PROCEDURE_REVIEW_REQUIRED") return "procedimiento pendiente de revisión por cuantía y régimen aplicable";
  return "pendiente";
}

export class AdaptiveProcurementFlow {
  public analyze(answers: AdaptiveFlowAnswers): AdaptiveFlowDecision {
    const nature = inferNature(answers);
    const lots = lotDecision(answers, nature.nature);
    const economic = economics(nature.nature, answers);
    const procedure = procedureDecision(nature.nature, economic, answers);
    const cpv = cpvDecision(nature.nature, answers);
    const proposals: string[] = [];
    const warnings: string[] = [];
    if (nature.nature !== "UNKNOWN") proposals.push(`Naturaleza contractual propuesta: ${nature.nature === "SERVICES" ? "servicios" : nature.nature === "SUPPLIES" ? "suministros" : "obras"}.`);
    if (lots.proposal === "SINGLE_LOT") proposals.push("Propuesta: lote único, con motivación específica pendiente de validación humana.");
    if (lots.proposal === "MULTIPLE_LOTS") proposals.push("Propuesta: estudiar varios lotes funcionalmente autónomos y motivar su configuración concreta.");
    const primaryCpv = cpv.find(item => item.role === "PRIMARY");
    if (primaryCpv) proposals.push(`CPV principal propuesto: ${primaryCpv.code}.`);
    if (procedure.procedure !== "PENDING") proposals.push(`Procedimiento propuesto: ${procedureLabel(procedure.procedure)}.`);
    if (economic.status === "PROVISIONAL") warnings.push("La configuración económica está pendiente; no se proyectarán importes mediante repartos lineales no justificados.");
    if (economic.status === "INCONSISTENT") warnings.push("La configuración económica no coincide con los datos declarados y debe corregirse antes de fijar el valor estimado.");
    if (answers.technicalContinuity === "UNKNOWN") warnings.push("No hay hechos suficientes para cerrar la decisión sobre lotes; debe recabarse información técnica adicional.");
    if (nature.nature === "WORKS" && answers.worksProjectStatus === "NEEDS_DRAFTING") warnings.push("No debe tratarse todavía como expediente ordinario de ejecución de obra: falta resolver la redacción/aprobación del proyecto o justificar el régimen excepcional que proceda.");
    if (nature.nature === "SERVICES" && answers.serviceMeansAvailability === "AVAILABLE") warnings.push("La unidad promotora declara que existen medios propios suficientes; debe revisarse la necesidad de contratación externa antes de continuar.");

    const legalGrounds: LegalGround[] = [
      { article: nature.nature === "WORKS" ? "LCSP art. 13" : nature.nature === "SUPPLIES" ? "LCSP art. 16" : "LCSP art. 17", rule: "La naturaleza contractual se determina por el contenido real de la prestación y no por la denominación utilizada por la unidad promotora.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
      { article: "LCSP arts. 99.3 y 116.4", rule: "La división en lotes debe analizarse y la decisión de no dividir debe motivarse en el expediente.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
      { article: "LCSP arts. 100, 101 y 102", rule: "Presupuesto, valor estimado y precio deben quedar diferenciados, ser adecuados al mercado y responder a la estructura real de la prestación.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
      { article: "Reglamento (CE) 2195/2002 y Reglamento (CE) 213/2008", rule: "El objeto y, cuando proceda, cada lote deben clasificarse mediante CPV.", source: "CPV", verification: "CURRENT_LAW_REQUIRED" },
      { article: "LCSP arts. 145 y 146", rule: "Los criterios deben estar vinculados al objeto y su ponderación y método de valoración deben quedar definidos y justificados.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" },
      { article: "LCSP art. 159", rule: "La cuantía y la configuración de los criterios condicionan la modalidad simplificada aplicable. En 2026 el art. 159.6 mantiene 80.000 € para obras y 60.000 € para suministros y servicios; el art. 159.1 remite en suministros y servicios al umbral actualizado de 140.000 €.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" }
    ];
    if (nature.nature === "SERVICES") legalGrounds.push({ article: "LCSP art. 116.4.f)", rule: "En contratos de servicios debe justificarse adecuadamente la insuficiencia de medios cuando resulte exigible.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" });
    if (nature.nature === "WORKS") legalGrounds.push({ article: "LCSP arts. 231 y ss.", rule: "La ejecución de obras exige la preparación técnica propia del contrato de obras, incluyendo proyecto y actuaciones previas que correspondan antes del inicio de la ejecución.", source: "LCSP", verification: "CURRENT_LAW_REQUIRED" });

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
      legalGrounds,
      nextQuestion: nextQuestion(answers, nature.nature, lots.proposal, economic)
    };
  }
}
