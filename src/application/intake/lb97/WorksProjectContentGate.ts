export interface WorksProjectContentInput {
  baseTenderBudgetExVatCents: number | null;
  workCategory: "FIRST_ESTABLISHMENT" | "REFORM" | "MAJOR_REPAIR" | "REPAIR" | "CONSERVATION" | "MAINTENANCE" | "RESTORATION" | "REHABILITATION" | "DEMOLITION" | "OTHER" | null;
  memory: boolean;
  plans: boolean;
  technicalSpecifications: boolean;
  budgetMeasurementsAndPrices: boolean;
  worksProgramme: boolean;
  replanteoReferences: boolean;
  healthAndSafetyStudy: boolean;
  otherLegallyRequiredDocuments: boolean | null;
  simplifiedProjectExpresslyMotivated?: boolean;
}

export interface WorksProjectContentResult {
  complete: boolean;
  simplificationPotentiallyAvailable: boolean;
  simplificationApplied: boolean;
  blockers: readonly string[];
  legalBasis: readonly ["art. 233 LCSP"];
  humanValidationRequired: true;
}

/**
 * Control conservador del art. 233 LCSP. La posibilidad de simplificar en
 * determinados proyectos <500.000 € no autoriza al sistema a suprimir piezas:
 * exige motivación expresa y nunca se aplica automáticamente.
 */
export function evaluateWorksProjectContent(input: WorksProjectContentInput): WorksProjectContentResult {
  const blockers:string[]=[];
  const eligibleCategory=["FIRST_ESTABLISHMENT","REFORM","MAJOR_REPAIR"].includes(String(input.workCategory));
  const simplificationPotentiallyAvailable=typeof input.baseTenderBudgetExVatCents==="number"&&input.baseTenderBudgetExVatCents<50_000_000&&eligibleCategory;
  const simplificationApplied=simplificationPotentiallyAvailable&&input.simplifiedProjectExpresslyMotivated===true;
  const required:Array<[boolean,string]>=[
    [input.memory,"memoria del proyecto"],
    [input.plans,"planos de conjunto y detalle"],
    [input.technicalSpecifications,"pliego de prescripciones técnicas particulares"],
    [input.budgetMeasurementsAndPrices,"presupuesto, mediciones y precios"],
    [input.worksProgramme,"programa de desarrollo de los trabajos"],
    [input.replanteoReferences,"referencias para el replanteo"],
    [input.healthAndSafetyStudy,"estudio o estudio básico de seguridad y salud"],
  ];
  if(input.baseTenderBudgetExVatCents===null) blockers.push("Falta PBL sin IVA para evaluar el régimen de posible simplificación del artículo 233.2 LCSP.");
  if(input.workCategory===null) blockers.push("Falta clasificación material de la obra para evaluar el artículo 233.2 LCSP.");
  if(input.otherLegallyRequiredDocuments===null) blockers.push("Debe verificarse expresamente si existe documentación adicional exigida por normas legales o reglamentarias.");
  if(input.otherLegallyRequiredDocuments===false) blockers.push("Falta documentación adicional legal o reglamentariamente exigible declarada para el proyecto.");
  for(const [present,label] of required){if(!present&&!simplificationApplied)blockers.push(`Falta ${label} del contenido mínimo del proyecto (art. 233 LCSP).`);}
  if(input.simplifiedProjectExpresslyMotivated===true&&!simplificationPotentiallyAvailable) blockers.push("Se ha intentado aplicar simplificación de proyecto sin quedar acreditado el supuesto habilitante del artículo 233.2 LCSP.");
  return{complete:blockers.length===0,simplificationPotentiallyAvailable,simplificationApplied,blockers,legalBasis:["art. 233 LCSP"],humanValidationRequired:true};
}
