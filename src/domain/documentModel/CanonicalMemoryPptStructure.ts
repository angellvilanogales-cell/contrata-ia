import type { SectionDefinition } from "./SectionDefinition";

export const CANONICAL_MEMORY_PPT_STRUCTURE_VERSION = "LB104-MEMORY-PPT-CANON-V1" as const;

export type CanonicalNonPcapDocument = "MEMORY" | "PPT";
export type CanonicalDocumentFamily = "SUPPLY" | "SERVICE" | "WORKS" | "CONCESSION" | "MIXED";
export type CanonicalOverlay =
  | "SERVICE_INSUFFICIENCY_OF_MEANS"
  | "WORKS_PROJECT_AND_PREPARATION"
  | "CONCESSION_VIABILITY_AND_RISK"
  | "MIXED_COMPONENTS_AND_PRINCIPAL_PERFORMANCE"
  | "EUROPEAN_FUNDS"
  | "SUCCESSIVE_NEEDS_CATALOGUE"
  | "SOFTWARE_LICENSING"
  | "DIGITAL_EQUIPMENT"
  | "SUPPLY_WITH_PLATFORM"
  | "HEALTH_FRAMEWORK"
  | "FURNITURE_INSTALLATION"
  | "SERVICE_PERSONNEL_AND_SUBROGATION";

export interface CanonicalDocumentSection {
  id: string;
  number: string;
  title: string;
  scope: "CORE" | "OVERLAY";
  document: CanonicalNonPcapDocument;
  legalArticles: readonly string[];
  sourceBasis: readonly string[];
  overlay?: CanonicalOverlay;
}

const MULTICASE_SUPPLY = ["CADIZ-MOBILIARIO", "VEIASA-WINDOWS-SERVER", "PANDA-ANTIVIRUS-AVRA", "AULAS-DIGITALES", "TABLETS-PLATAFORMA", "SAS-470-2025"] as const;
const MULTICASE_SERVICE = ["CARL-2024-CLEANING", "SAE-HUELVA-CLEANING", "SAE-SEVILLE-MAINTENANCE", "FPE-5G-TRAINING"] as const;
const ALL_CORPUS = [...MULTICASE_SUPPLY, ...MULTICASE_SERVICE] as const;

/**
 * Canon interno de Contrata-IA. Memoria y PPT no disponen de un modelo oficial
 * transversal equivalente al PCAP: estos títulos estabilizan funciones que el
 * corpus real denomina de forma distinta. Los números CORE nunca cambian; los
 * especiales se insertan como subepígrafes para no renumerar el documento.
 */
export const CANONICAL_MEMORY_CORE: readonly CanonicalDocumentSection[] = [
  {id:"BACKGROUND_COMPETENCE",number:"1",title:"Antecedentes y competencia",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-28","LCSP-116"],sourceBasis:ALL_CORPUS},
  {id:"NEED_SUITABILITY",number:"2",title:"Necesidad e idoneidad de la contratación",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-28","LCSP-116.1"],sourceBasis:ALL_CORPUS},
  {id:"OBJECT_NATURE_CPV",number:"3",title:"Objeto, naturaleza y codificación CPV",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-18","LCSP-99"],sourceBasis:ALL_CORPUS},
  {id:"LOTS",number:"4",title:"División en lotes",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-99.3"],sourceBasis:ALL_CORPUS},
  {id:"BUDGET_PRICE",number:"5",title:"Presupuesto base de licitación y sistema de determinación del precio",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-100","LCSP-102"],sourceBasis:ALL_CORPUS},
  {id:"ESTIMATED_VALUE",number:"6",title:"Valor estimado del contrato y método de cálculo",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-101"],sourceBasis:ALL_CORPUS},
  {id:"FUNDING_ANNUALITIES",number:"7",title:"Financiación y anualidades",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-116.3"],sourceBasis:ALL_CORPUS},
  {id:"DURATION_EXTENSIONS",number:"8",title:"Duración, prórrogas y plazos de ejecución",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-29"],sourceBasis:ALL_CORPUS},
  {id:"PROCEDURE_PROCESSING",number:"9",title:"Procedimiento de adjudicación y tramitación",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-116.4","LCSP-131"],sourceBasis:ALL_CORPUS},
  {id:"CAPACITY_SOLVENCY",number:"10",title:"Capacidad, habilitación y solvencia",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-65","LCSP-74","LCSP-86"],sourceBasis:ALL_CORPUS},
  {id:"AWARD_CRITERIA",number:"11",title:"Criterios de adjudicación",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-116.4","LCSP-145","LCSP-146"],sourceBasis:ALL_CORPUS},
  {id:"GUARANTEES",number:"12",title:"Garantías",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-106","LCSP-107"],sourceBasis:ALL_CORPUS},
  {id:"SPECIAL_EXECUTION",number:"13",title:"Condiciones especiales de ejecución",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-202"],sourceBasis:ALL_CORPUS},
  {id:"SUBCONTRACTING_ASSIGNMENT",number:"14",title:"Subcontratación y cesión",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-214","LCSP-215"],sourceBasis:ALL_CORPUS},
  {id:"MODIFICATIONS",number:"15",title:"Modificaciones previstas",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-204"],sourceBasis:ALL_CORPUS},
  {id:"PRICE_REVISION",number:"16",title:"Revisión de precios",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-103"],sourceBasis:ALL_CORPUS},
  {id:"MANAGEMENT_EXECUTION_PAYMENT",number:"17",title:"Responsable del contrato, ejecución, recepción y pago",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-62","LCSP-198","LCSP-210"],sourceBasis:ALL_CORPUS},
  {id:"DATA_SECURITY",number:"18",title:"Protección de datos y seguridad de la información",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-122.2"],sourceBasis:ALL_CORPUS},
  {id:"CONCLUSION_PROPOSAL",number:"19",title:"Conclusión y propuesta",scope:"CORE",document:"MEMORY",legalArticles:["LCSP-28","LCSP-116"],sourceBasis:ALL_CORPUS},
] as const;

export const CANONICAL_PPT_CORE: readonly CanonicalDocumentSection[] = [
  {id:"TECHNICAL_OBJECT_SCOPE",number:"1",title:"Objeto y alcance de las prescripciones técnicas",scope:"CORE",document:"PPT",legalArticles:["LCSP-124","LCSP-125"],sourceBasis:ALL_CORPUS},
  {id:"TECHNICAL_MANAGEMENT",number:"2",title:"Organización e interlocución técnica",scope:"CORE",document:"PPT",legalArticles:["LCSP-62","LCSP-124"],sourceBasis:ALL_CORPUS},
  {id:"TERM_LOCATION_DELIVERY",number:"3",title:"Plazo, lugar y condiciones de entrega o ejecución",scope:"CORE",document:"PPT",legalArticles:["LCSP-29","LCSP-124"],sourceBasis:ALL_CORPUS},
  {id:"MINIMUM_TECHNICAL_REQUIREMENTS",number:"4",title:"Descripción y requisitos técnicos mínimos",scope:"CORE",document:"PPT",legalArticles:["LCSP-124","LCSP-126"],sourceBasis:ALL_CORPUS},
  {id:"PERSONNEL_MATERIAL_MEANS",number:"5",title:"Medios personales y materiales",scope:"CORE",document:"PPT",legalArticles:["LCSP-124"],sourceBasis:ALL_CORPUS},
  {id:"COORDINATION_QUALITY",number:"6",title:"Coordinación, seguimiento y control de calidad",scope:"CORE",document:"PPT",legalArticles:["LCSP-62","LCSP-124"],sourceBasis:ALL_CORPUS},
  {id:"RECEPTION_CONFORMITY",number:"7",title:"Entrega o realización, recepción y conformidad",scope:"CORE",document:"PPT",legalArticles:["LCSP-210","LCSP-300","LCSP-311"],sourceBasis:ALL_CORPUS},
  {id:"TECHNICAL_OBLIGATIONS",number:"8",title:"Obligaciones técnicas de la persona contratista",scope:"CORE",document:"PPT",legalArticles:["LCSP-124"],sourceBasis:ALL_CORPUS},
  {id:"WARRANTY_SUPPORT",number:"9",title:"Garantía técnica, mantenimiento y soporte",scope:"CORE",document:"PPT",legalArticles:["LCSP-210","LCSP-305"],sourceBasis:ALL_CORPUS},
  {id:"INFORMATION_SECURITY",number:"10",title:"Seguridad de la información, confidencialidad y protección de datos",scope:"CORE",document:"PPT",legalArticles:["LCSP-122.2","LCSP-124"],sourceBasis:ALL_CORPUS},
  {id:"ENVIRONMENT_WASTE",number:"11",title:"Sostenibilidad, gestión ambiental y residuos",scope:"CORE",document:"PPT",legalArticles:["LCSP-124","LCSP-126","LCSP-202"],sourceBasis:ALL_CORPUS},
  {id:"TECHNICAL_DOCUMENTATION_ANNEXES",number:"12",title:"Documentación técnica y anexos",scope:"CORE",document:"PPT",legalArticles:["LCSP-124","LCSP-126"],sourceBasis:ALL_CORPUS},
] as const;

export const CANONICAL_MEMORY_OVERLAYS: readonly CanonicalDocumentSection[] = [
  {id:"INSUFFICIENCY_OF_MEANS",number:"2.1",title:"Insuficiencia de medios propios",scope:"OVERLAY",document:"MEMORY",overlay:"SERVICE_INSUFFICIENCY_OF_MEANS",legalArticles:["LCSP-116.4.f"],sourceBasis:MULTICASE_SERVICE},
  {id:"WORKS_PROJECT_PREPARATION",number:"3.1",title:"Proyecto, supervisión, replanteo y actuaciones preparatorias",scope:"OVERLAY",document:"MEMORY",overlay:"WORKS_PROJECT_AND_PREPARATION",legalArticles:["LCSP-231","LCSP-235","LCSP-236"],sourceBasis:["JDA-WORKS-REAL-CORPUS"]},
  {id:"CONCESSION_VIABILITY_RISK",number:"3.1",title:"Estudio de viabilidad y transferencia del riesgo operacional",scope:"OVERLAY",document:"MEMORY",overlay:"CONCESSION_VIABILITY_AND_RISK",legalArticles:["LCSP-14","LCSP-15","LCSP-247","LCSP-285"],sourceBasis:["JDA-CONCESSION-REAL-CORPUS"]},
  {id:"MIXED_COMPONENTS",number:"3.1",title:"Prestaciones, valor estimado y régimen de la prestación principal",scope:"OVERLAY",document:"MEMORY",overlay:"MIXED_COMPONENTS_AND_PRINCIPAL_PERFORMANCE",legalArticles:["LCSP-18","LCSP-34","LCSP-122.2"],sourceBasis:["JDA-MIXED-REAL-CORPUS"]},
  {id:"EUROPEAN_FUNDS",number:"7.1",title:"Obligaciones específicas de la financiación europea",scope:"OVERLAY",document:"MEMORY",overlay:"EUROPEAN_FUNDS",legalArticles:["LCSP-116"],sourceBasis:["AULAS-DIGITALES","TABLETS-PLATAFORMA"]},
  {id:"SUCCESSIVE_NEEDS_DA33",number:"6.1",title:"Suministro por necesidades y disposición adicional 33.ª",scope:"OVERLAY",document:"MEMORY",overlay:"SUCCESSIVE_NEEDS_CATALOGUE",legalArticles:["LCSP-DA33"],sourceBasis:["FERRETERIA-2026","SAS-470-2025"]},
] as const;

export const CANONICAL_PPT_OVERLAYS: readonly CanonicalDocumentSection[] = [
  {id:"ESTIMATED_CONSUMPTION",number:"4.1",title:"Catálogo, unidades estimadas y precios unitarios",scope:"OVERLAY",document:"PPT",overlay:"SUCCESSIVE_NEEDS_CATALOGUE",legalArticles:["LCSP-124","LCSP-DA33"],sourceBasis:["FERRETERIA-2026","SAS-470-2025"]},
  {id:"DEFECTIVE_GOODS",number:"7.1",title:"Reposición de bienes defectuosos",scope:"OVERLAY",document:"PPT",overlay:"SUCCESSIVE_NEEDS_CATALOGUE",legalArticles:["LCSP-300"],sourceBasis:["FERRETERIA-2026","SAS-470-2025"]},
  {id:"SOFTWARE_LICENSING",number:"4.1",title:"Licenciamiento, derechos de uso, actualizaciones y soporte",scope:"OVERLAY",document:"PPT",overlay:"SOFTWARE_LICENSING",legalArticles:["LCSP-124","LCSP-126"],sourceBasis:["PANDA-ANTIVIRUS-AVRA","VEIASA-WINDOWS-SERVER"]},
  {id:"DIGITAL_COMPATIBILITY",number:"4.1",title:"Compatibilidad, configuración, interoperabilidad y puesta en servicio",scope:"OVERLAY",document:"PPT",overlay:"DIGITAL_EQUIPMENT",legalArticles:["LCSP-124","LCSP-126"],sourceBasis:["AULAS-DIGITALES","TABLETS-PLATAFORMA"]},
  {id:"PLATFORM_LEVELS",number:"4.2",title:"Plataforma asociada, niveles de servicio y ubicación de los datos",scope:"OVERLAY",document:"PPT",overlay:"SUPPLY_WITH_PLATFORM",legalArticles:["LCSP-18","LCSP-124","LCSP-122.2"],sourceBasis:["TABLETS-PLATAFORMA"]},
  {id:"HEALTH_TRACEABILITY",number:"4.1",title:"Requisitos sanitarios, trazabilidad y logística hospitalaria",scope:"OVERLAY",document:"PPT",overlay:"HEALTH_FRAMEWORK",legalArticles:["LCSP-124","LCSP-126"],sourceBasis:["SAS-470-2025"]},
  {id:"FURNITURE_INSTALLATION",number:"4.1",title:"Medición, transporte, montaje, instalación y puesta en funcionamiento",scope:"OVERLAY",document:"PPT",overlay:"FURNITURE_INSTALLATION",legalArticles:["LCSP-124","LCSP-300"],sourceBasis:["CADIZ-MOBILIARIO"]},
  {id:"SERVICE_PERSONNEL_SUBROGATION",number:"5.1",title:"Organización del servicio, personal, horarios y subrogación",scope:"OVERLAY",document:"PPT",overlay:"SERVICE_PERSONNEL_AND_SUBROGATION",legalArticles:["LCSP-124","LCSP-130"],sourceBasis:MULTICASE_SERVICE},
  {id:"WORKS_PROJECT_SCOPE",number:"4.1",title:"Proyecto, unidades de obra y condiciones del emplazamiento",scope:"OVERLAY",document:"PPT",overlay:"WORKS_PROJECT_AND_PREPARATION",legalArticles:["LCSP-231","LCSP-233"],sourceBasis:["JDA-WORKS-REAL-CORPUS"]},
  {id:"CONCESSION_CONTINUITY",number:"4.1",title:"Continuidad del servicio, personas usuarias, tarifas y reversión",scope:"OVERLAY",document:"PPT",overlay:"CONCESSION_VIABILITY_AND_RISK",legalArticles:["LCSP-285","LCSP-286","LCSP-291"],sourceBasis:["JDA-CONCESSION-REAL-CORPUS"]},
  {id:"MIXED_TECHNICAL_COMPONENTS",number:"4.1",title:"Prescripciones diferenciadas por prestación e integración técnica",scope:"OVERLAY",document:"PPT",overlay:"MIXED_COMPONENTS_AND_PRINCIPAL_PERFORMANCE",legalArticles:["LCSP-18","LCSP-122.2","LCSP-124"],sourceBasis:["JDA-MIXED-REAL-CORPUS"]},
] as const;

const FAMILY_OVERLAYS: Readonly<Record<CanonicalDocumentFamily, readonly CanonicalOverlay[]>> = {
  SUPPLY: [], SERVICE:["SERVICE_INSUFFICIENCY_OF_MEANS","SERVICE_PERSONNEL_AND_SUBROGATION"],
  WORKS:["WORKS_PROJECT_AND_PREPARATION"], CONCESSION:["CONCESSION_VIABILITY_AND_RISK"],
  MIXED:["MIXED_COMPONENTS_AND_PRINCIPAL_PERFORMANCE"],
};

export type CanonicalSupplyVariant = "CATALOGUE_NEEDS" | "ICT_LICENSE_OR_SOFTWARE" | "DIGITAL_EQUIPMENT" | "SUPPLY_WITH_SERVICE_COMPONENT" | "MEDICAL_FRAMEWORK" | "FURNITURE_INSTALLATION" | "ORDINARY_GLOBAL_PRICE";

/** Selección determinista de especialidades; nunca se deduce del CPV. */
export function canonicalSupplyOverlaysFromFacts(input:{variant:CanonicalSupplyVariant;fundingSource:"AUTOFINANCED"|"EU_FUNDS"|"OTHER"|"UNKNOWN"}):readonly CanonicalOverlay[]{
  const byVariant:Readonly<Record<CanonicalSupplyVariant,readonly CanonicalOverlay[]>>={
    CATALOGUE_NEEDS:["SUCCESSIVE_NEEDS_CATALOGUE"],
    ICT_LICENSE_OR_SOFTWARE:["SOFTWARE_LICENSING"],
    DIGITAL_EQUIPMENT:["DIGITAL_EQUIPMENT"],
    SUPPLY_WITH_SERVICE_COMPONENT:["SUPPLY_WITH_PLATFORM"],
    MEDICAL_FRAMEWORK:["SUCCESSIVE_NEEDS_CATALOGUE","HEALTH_FRAMEWORK"],
    FURNITURE_INSTALLATION:["FURNITURE_INSTALLATION"],
    ORDINARY_GLOBAL_PRICE:[],
  };
  return [...byVariant[input.variant],...(input.fundingSource==="EU_FUNDS"?["EUROPEAN_FUNDS" as const]:[])];
}

function orderKey(number:string):number[]{return number.split(".").map(Number);}
function compareSections(a:CanonicalDocumentSection,b:CanonicalDocumentSection):number{const aa=orderKey(a.number),bb=orderKey(b.number);for(let i=0;i<Math.max(aa.length,bb.length);i+=1){const d=(aa[i]??0)-(bb[i]??0);if(d)return d;}return a.id.localeCompare(b.id);}

export function canonicalMemoryPptStructure(input:{document:CanonicalNonPcapDocument;family:CanonicalDocumentFamily;overlays?:readonly CanonicalOverlay[]}):readonly CanonicalDocumentSection[]{
  const enabled=new Set([...FAMILY_OVERLAYS[input.family],...(input.overlays??[])]);
  const core=input.document==="MEMORY"?CANONICAL_MEMORY_CORE:CANONICAL_PPT_CORE;
  const optional=input.document==="MEMORY"?CANONICAL_MEMORY_OVERLAYS:CANONICAL_PPT_OVERLAYS;
  return [...core,...optional.filter(section=>section.overlay&&enabled.has(section.overlay))].sort(compareSections);
}

export function auditCanonicalMemoryPptHeadings(input:{document:CanonicalNonPcapDocument;family:CanonicalDocumentFamily;overlays?:readonly CanonicalOverlay[];headings:readonly {number:string;title:string}[]}){
  const expected=canonicalMemoryPptStructure(input).map(({number,title})=>({number,title}));const blockers:string[]=[];
  if(input.headings.length!==expected.length)blockers.push(`Se esperaban ${expected.length} epígrafes y se han encontrado ${input.headings.length}.`);
  for(const [index,item] of expected.entries()){const actual=input.headings[index];if(!actual)continue;if(actual.number!==item.number||actual.title!==item.title)blockers.push(`Epígrafe ${index+1}: se esperaba «${item.number}. ${item.title}» y se encontró «${actual.number}. ${actual.title}».`);}
  return{ready:blockers.length===0,version:CANONICAL_MEMORY_PPT_STRUCTURE_VERSION,expected,blockers} as const;
}

export function canonicalSectionsAsDefinitions(document:CanonicalNonPcapDocument,family:CanonicalDocumentFamily,overlays:readonly CanonicalOverlay[]=[]):SectionDefinition[]{
  return canonicalMemoryPptStructure({document,family,overlays}).map((section,index)=>({id:section.id,order:index+1,title:section.title,description:`${section.scope==="CORE"?"Epígrafe común":"Epígrafe especial"} ${section.number} del canon ${CANONICAL_MEMORY_PPT_STRUCTURE_VERSION}.`,mandatory:section.scope==="CORE",editable:true,reusable:section.scope==="CORE",reusableKey:section.id,legalArticles:[...section.legalArticles],dependsOn:[],excludes:[],priority:section.scope==="CORE"?100:80,isVisible:()=>true,shouldRender:()=>true}));
}

export const CANONICAL_STRUCTURE_SOURCE_CORPUS = [
  {id:"CADIZ-MOBILIARIO",family:"SUPPLY",memory:true,ppt:true,contribution:"Objeto, necesidad, economía, instalación, garantía y anexo técnico."},
  {id:"VEIASA-WINDOWS-SERVER",family:"SUPPLY",memory:true,ppt:true,contribution:"Licencias, entrega, soporte, calidad y responsable."},
  {id:"PANDA-ANTIVIRUS-AVRA",family:"SUPPLY",memory:true,ppt:true,contribution:"Software, seguridad, licenciamiento, solvencia y controles previos."},
  {id:"AULAS-DIGITALES",family:"SUPPLY",memory:true,ppt:true,contribution:"PRTR, lotes, logística, recepción, interoperabilidad, DNSH y anexos."},
  {id:"TABLETS-PLATAFORMA",family:"MIXED",memory:true,ppt:true,contribution:"Prestación Supply-Service, plataforma, datos, formación e integración."},
  {id:"SAS-470-2025",family:"SUPPLY",memory:true,ppt:true,contribution:"Acuerdo marco, tracto sucesivo, catálogo sanitario, trazabilidad y logística."},
  {id:"CARL-2024-CLEANING",family:"SERVICE",memory:true,ppt:true,contribution:"Insuficiencia de medios, personal, control, pago y responsable."},
  {id:"SAE-HUELVA-CLEANING",family:"SERVICE",memory:true,ppt:true,contribution:"Centros, costes laborales, solvencia, ejecución y recepción."},
  {id:"SAE-SEVILLE-MAINTENANCE",family:"SERVICE",memory:true,ppt:true,contribution:"Lotes técnicos, mantenimiento, medios, calidad, prevención y control."},
] as const;
