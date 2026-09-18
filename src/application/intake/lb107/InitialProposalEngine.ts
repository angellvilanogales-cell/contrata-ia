import fs from "node:fs";
import path from "node:path";
import type { CPVEntry } from "../../../domain/cpv/CPVEntry";

export const LB107_INITIAL_PROPOSAL_VERSION = "LB107-INITIAL-PROPOSAL-V1" as const;
const LCSP_URL = "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";
const CPV_URL = "https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32002R2195";

export type InitialContractType = "SUPPLY" | "SERVICE";

export interface InitialLegalBasis {
  id: string;
  norm: string;
  article: string;
  paragraph: string;
  relevantOfficialExcerpt: string;
  officialUrl: string;
  sourceAuthority: "BOE" | "EUR_LEX";
  consolidatedAt?: string;
}

export interface InitialCpvCandidate {
  code: string;
  officialDescription: string;
  score: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  suggestedRole: "PRIMARY" | "COMPLEMENTARY";
  explanation: string;
}

export interface InitialProposalResult {
  version: typeof LB107_INITIAL_PROPOSAL_VERSION;
  sourceDescription: string;
  objectDraft: string;
  scopeDraft: string;
  needDraft: string;
  contractType: {
    recommended: InitialContractType;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    reasoning: string;
    alternatives: readonly InitialContractType[];
  };
  cpvCandidates: InitialCpvCandidate[];
  lots: {
    recommended: boolean;
    confidence: "MEDIUM" | "LOW";
    reasoning: string;
    suggestedDefinitions: readonly {
      name: string;
      description: string;
    }[];
    noDivisionJustificationDraft?: string;
  };
  legalBasisByDecision: {
    object: readonly InitialLegalBasis[];
    contractType: readonly InitialLegalBasis[];
    cpv: readonly InitialLegalBasis[];
    need: readonly InitialLegalBasis[];
    lots: readonly InitialLegalBasis[];
  };
  humanValidationRequired: true;
  productionReady: false;
}

const LEGAL = {
  object99: basis("LCSP-99.1", "Ley 9/2017, de Contratos del Sector Público", "99", "1", "El objeto de los contratos del sector público deberá ser determinado.", `${LCSP_URL}#a99`, "BOE"),
  type12: basis("LCSP-12.1", "Ley 9/2017, de Contratos del Sector Público", "12", "1", "Los contratos de obras, concesión de obras, concesión de servicios, suministro y servicios se calificarán de acuerdo con las normas contenidas en la presente sección.", `${LCSP_URL}#a12`, "BOE"),
  supply16: basis("LCSP-16.1", "Ley 9/2017, de Contratos del Sector Público", "16", "1", "Son contratos de suministro los que tienen por objeto la adquisición, el arrendamiento financiero, o el arrendamiento, con o sin opción de compra, de productos o bienes muebles.", `${LCSP_URL}#a16`, "BOE"),
  service17: basis("LCSP-17", "Ley 9/2017, de Contratos del Sector Público", "17", "único", "Son contratos de servicios aquellos cuyo objeto son prestaciones de hacer consistentes en el desarrollo de una actividad o dirigidas a la obtención de un resultado distinto de una obra o suministro.", `${LCSP_URL}#a17`, "BOE"),
  cpv1: basis("CPV-2195-1", "Reglamento (CE) n.º 2195/2002", "1", "1", "Se aprueba un sistema de clasificación único aplicable a los contratos públicos denominado Vocabulario común de contratos públicos (CPV).", CPV_URL, "EUR_LEX"),
  need28: basis("LCSP-28.1", "Ley 9/2017, de Contratos del Sector Público", "28", "1", "Las entidades del sector público no podrán celebrar otros contratos que aquellos que sean necesarios para el cumplimiento y realización de sus fines institucionales.", `${LCSP_URL}#a28`, "BOE"),
  need116: basis("LCSP-116.1", "Ley 9/2017, de Contratos del Sector Público", "116", "1", "El expediente se iniciará por el órgano de contratación motivando la necesidad del contrato en los términos previstos en el artículo 28.", `${LCSP_URL}#a116`, "BOE"),
  relation116: basis("LCSP-116.4.e", "Ley 9/2017, de Contratos del Sector Público", "116", "4.e", "La necesidad de la Administración y su relación con el objeto del contrato deberá ser directa, clara y proporcional.", `${LCSP_URL}#a116`, "BOE"),
  lots99: basis("LCSP-99.3", "Ley 9/2017, de Contratos del Sector Público", "99", "3", "Siempre que la naturaleza o el objeto del contrato lo permitan, deberá preverse la realización independiente de cada una de sus partes mediante su división en lotes.", `${LCSP_URL}#a99`, "BOE"),
} as const;

function basis(
  id: string,
  norm: string,
  article: string,
  paragraph: string,
  relevantOfficialExcerpt: string,
  officialUrl: string,
  sourceAuthority: "BOE" | "EUR_LEX",
): InitialLegalBasis {
  return {
    id, norm, article, paragraph, relevantOfficialExcerpt, officialUrl, sourceAuthority,
    ...(sourceAuthority === "BOE" ? { consolidatedAt: "2026-04-09" } : {}),
  };
}

const STOP_WORDS = new Set([
  "para", "como", "con", "sin", "del", "las", "los", "una", "uno", "unos", "unas", "por", "que", "sus", "este", "esta", "estos", "estas", "desde", "hasta", "sobre", "entre", "mediante", "necesita", "necesitamos", "contratar", "contratacion", "administracion",
]);

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value: string): string[] {
  return normalize(value).split(" ").filter(token => token.length >= 3 && !STOP_WORDS.has(token));
}

function specificity(code: string): number {
  const digits = code.slice(0, 8);
  return Math.max(0, 6 - (digits.match(/0+$/)?.[0].length ?? 0));
}

interface CpvContextProfile {
  matches: (text: string) => boolean;
  accepts: (entry: CPVEntry) => boolean;
  preferredCodes: readonly string[];
}

const CPV_CONTEXT_PROFILES: readonly CpvContextProfile[] = [
  {
    matches: text => ["idioma", "idiomas", "linguistica", "ingles", "portugues", "espanol como lengua", "lengua extranjera"].some(term => text.includes(term)),
    accepts: entry => ["80580000-3", "79632000-3", "80511000-9", "80570000-0"].includes(entry.codigo),
    preferredCodes: ["80580000-3"],
  },
  {
    matches: text => ["orientacion profesional", "empleabilidad", "insercion laboral", "movilidad laboral", "acompanamiento laboral", "coaching"].some(term => text.includes(term)),
    accepts: entry => ["79634000-7", "85312310-5", "85312300-2"].includes(entry.codigo),
    preferredCodes: ["79634000-7"],
  },
];

const CPV_SELECTION_GUIDANCE: Readonly<Record<string, string>> = {
  "80580000-3": "Código específico para la impartición de cursos de idiomas; es el candidato más directo cuando el lote tiene por objeto formación lingüística.",
  "79632000-3": "Código general de formación de personal; puede utilizarse como complementario cuando se quiere reflejar que las personas destinatarias pertenecen a la plantilla.",
  "80511000-9": "Código general de servicios de formación del personal; resulta menos específico que el de cursos de idiomas y normalmente será complementario.",
  "80570000-0": "Código de perfeccionamiento personal; solo conviene seleccionarlo si el contenido incluye desarrollo o mejora personal además de la formación lingüística.",
  "79634000-7": "Código específico para orientación profesional; encaja directamente con actuaciones de empleabilidad, acompañamiento laboral o movilidad profesional.",
  "85312310-5": "Código general de servicios de orientación; puede complementar al código profesional cuando el acompañamiento excede el ámbito estrictamente laboral.",
  "85312300-2": "Código general de orientación y asesoramiento; debe elegirse solo si el lote incluye también asesoramiento individual o grupal diferenciado.",
};

function contractType(description: string): InitialProposalResult["contractType"] {
  const text = normalize(description);
  const supplyTerms = ["adquirir", "adquisicion", "suministro", "comprar", "bienes", "productos", "material", "materiales", "equipos", "licencias", "mobiliario", "articulos"];
  const serviceTerms = ["servicio", "mantenimiento", "limpieza", "consultoria", "asistencia", "desarrollo", "formacion", "gestion", "soporte", "vigilancia", "redaccion"];
  const supplyScore = supplyTerms.filter(term => text.includes(term)).length;
  const serviceScore = serviceTerms.filter(term => text.includes(term)).length;
  const recommended: InitialContractType = supplyScore > serviceScore ? "SUPPLY" : "SERVICE";
  const difference = Math.abs(supplyScore - serviceScore);
  const confidence = difference >= 2 ? "HIGH" : difference === 1 ? "MEDIUM" : "LOW";
  const reasoning = recommended === "SUPPLY"
    ? "La descripción se orienta principalmente a adquirir o recibir bienes muebles. Debe comprobarse si los trabajos accesorios alteran la prestación principal."
    : "La descripción se orienta principalmente a una actividad o resultado de hacer. Debe comprobarse que no predomina la adquisición de bienes.";
  return { recommended, confidence, reasoning, alternatives: recommended === "SUPPLY" ? ["SERVICE"] : ["SUPPLY"] };
}

function cleanDescription(description: string): string {
  const clean = description.trim().replace(/\s+/g, " ").replace(/^(necesito|necesitamos|se necesita|se requiere|queremos|quiero)\s+/i, "");
  return clean.charAt(0).toLowerCase() + clean.slice(1).replace(/[.]$/, "");
}

function rankCpvs(description: string, catalog: readonly CPVEntry[]): InitialCpvCandidate[] {
  const queryTokens = new Set(tokens(description));
  if (!queryTokens.size) return [];
  const normalizedQuery = normalize(description);
  const activeProfiles = CPV_CONTEXT_PROFILES.filter(profile => profile.matches(normalizedQuery));
  const ranked = catalog.map(entry => {
    const descriptionTokens = new Set(tokens(entry.descripcion));
    const matching = [...queryTokens].filter(token => descriptionTokens.has(token));
    const normalizedEntry = normalize(entry.descripcion);
    const phrase = normalizedEntry.length >= 8 && (normalizedQuery.includes(normalizedEntry) || normalizedEntry.includes(normalizedQuery));
    const acceptedByContext = activeProfiles.length === 0 || activeProfiles.some(profile => profile.accepts(entry));
    const contextScore = activeProfiles.reduce((sum, profile) => sum + (profile.preferredCodes.includes(entry.codigo) ? 60 : profile.accepts(entry) ? 25 : 0), 0);
    const score = matching.reduce((sum, token) => sum + Math.min(18, 7 + token.length), 0) + (phrase ? 15 : 0) + Math.min(5, specificity(entry.codigo)) + contextScore;
    return { entry, matching, score, acceptedByContext };
  }).filter(item => item.score > 0 && item.acceptedByContext)
    .sort((a, b) => b.score - a.score || specificity(b.entry.codigo) - specificity(a.entry.codigo) || a.entry.codigo.localeCompare(b.entry.codigo))
    .slice(0, 10);
  const max = ranked[0]?.score ?? 1;
  return ranked.map((item, index) => {
    const relative = Math.round(item.score / max * 100);
    return {
      code: item.entry.codigo,
      officialDescription: item.entry.descripcion,
      score: relative,
      confidence: relative >= 80 && item.matching.length >= 2 ? "HIGH" : relative >= 55 ? "MEDIUM" : "LOW",
      suggestedRole: index === 0 ? "PRIMARY" : "COMPLEMENTARY",
      explanation: `${CPV_SELECTION_GUIDANCE[item.entry.codigo] ?? `Coincide con estos términos del lote: ${item.matching.join(", ") || "coincidencia de expresión"}.`} ${index === 0 ? "Se propone como principal por ser la opción más específica encontrada." : "Se propone como posible complementario; no debe marcarse si no añade una prestación real distinta."}`,
    } satisfies InitialCpvCandidate;
  });
}

function suggestedLotDefinitions(description: string): InitialProposalResult["lots"]["suggestedDefinitions"] {
  const parts = description.replace(/\r/g, "\n")
    .replace(/([.!?])\s+(?=[A-ZÁÉÍÓÚÑ])/g, "$1\n")
    .split(/\n+|;+/)
    .map(part => part.trim().replace(/^[-*•\d.)\s]+/, "").replace(/[:.]$/, ""))
    .filter(part => part.length >= 12);
  if (parts.length < 2) return [];
  return parts.map((descriptionPart, index) => {
    const concise = descriptionPart.split(/,|:|\bmediante\b|\bdirigid[oa]s?\b/i)[0]?.trim() || descriptionPart;
    const title = concise.length > 90 ? `${concise.slice(0, 87).trim()}...` : concise;
    return {
      name: `Lote ${index + 1} · ${title.charAt(0).toUpperCase()}${title.slice(1)}`,
      description: descriptionPart,
    };
  });
}

function lotsProposal(description: string): InitialProposalResult["lots"] {
  const text = normalize(description);
  const suggestedDefinitions = suggestedLotDefinitions(description);
  const integrated = ["integral", "unidad funcional", "coordinacion unica", "interdependiente", "solucion unica"].some(term => text.includes(term));
  const separated = ["familias", "categorias", "sedes", "especialidades", "prestaciones diferenciadas", "por zonas"].some(term => text.includes(term)) || suggestedDefinitions.length >= 2;
  if (integrated && !separated) return {
    recommended: false,
    confidence: "MEDIUM",
    reasoning: "La descripción contiene indicios de integración o coordinación técnica. Se propone provisionalmente un lote único, sujeto a que la persona confirme el motivo concreto.",
    suggestedDefinitions: [],
    noDivisionJustificationDraft: "La ejecución independiente podría dificultar la correcta ejecución desde el punto de vista técnico por la coordinación necesaria entre las prestaciones descritas. Esta motivación debe concretarse y validarse con hechos del expediente.",
  };
  return {
    recommended: true,
    confidence: separated ? "MEDIUM" : "LOW",
    reasoning: separated
      ? "La descripción contiene grupos o ámbitos diferenciados que pueden ser susceptibles de ejecución independiente. Se propone estudiar su división en lotes."
      : "Como regla inicial del artículo 99.3 LCSP se propone estudiar la división en lotes. Falta confirmar la separabilidad técnica y económica del objeto.",
    suggestedDefinitions,
  };
}

let cachedCatalog: CPVEntry[] | undefined;
export function loadProjectCpvCatalog(): CPVEntry[] {
  if (cachedCatalog) return cachedCatalog;
  const root = path.join(process.cwd(), "knowledge", "cpv");
  const partRoot = path.join(root, "parts");
  const files = [path.join(root, "cpv.json"), ...(fs.existsSync(partRoot) ? fs.readdirSync(partRoot).filter(name => /^cpv-\d+\.json$/.test(name)).sort().map(name => path.join(partRoot, name)) : [])];
  const parsed = files.flatMap(file => JSON.parse(fs.readFileSync(file, "utf8")) as CPVEntry[]);
  cachedCatalog = [...new Map(parsed.filter(entry => /^\d{8}-\d$/.test(entry.codigo) && entry.descripcion.trim().length > 0 && entry.activo !== false).map(entry => [entry.codigo, entry])).values()];
  return cachedCatalog;
}

export function createInitialProposal(description: string, catalog: readonly CPVEntry[] = loadProjectCpvCatalog()): InitialProposalResult {
  const sourceDescription = description.trim().replace(/\s+/g, " ");
  if (sourceDescription.length < 20) throw new Error("Describa con algo más de detalle qué se necesita y qué resultado, bienes o trabajos se esperan.");
  if (sourceDescription.length > 6000) throw new Error("La descripción inicial no puede superar 6.000 caracteres.");
  const type = contractType(sourceDescription);
  const clean = cleanDescription(sourceDescription);
  const objectDraft = type.recommended === "SUPPLY" ? `Suministro de ${clean}` : `Servicio de ${clean}`;
  const scopeDraft = type.recommended === "SUPPLY"
    ? `La prestación comprende la entrega de los bienes y elementos descritos, en las condiciones que se concreten posteriormente en el PPT.`
    : `La prestación comprende la realización de las actividades y la obtención de los resultados descritos, con el alcance que se concrete posteriormente en el PPT.`;
  const needDraft = `La Administración necesita ${clean}. La contratación propuesta se vincula directamente con esta necesidad y se considera idónea para atenderla, sin perjuicio de la validación y concreción de los hechos por la unidad promotora.`;
  return {
    version: LB107_INITIAL_PROPOSAL_VERSION,
    sourceDescription,
    objectDraft,
    scopeDraft,
    needDraft,
    contractType: type,
    cpvCandidates: rankCpvs(sourceDescription, catalog),
    lots: lotsProposal(description),
    legalBasisByDecision: {
      object: [LEGAL.object99],
      contractType: [LEGAL.type12, LEGAL.supply16, LEGAL.service17],
      cpv: [LEGAL.cpv1],
      need: [LEGAL.need28, LEGAL.need116, LEGAL.relation116],
      lots: [LEGAL.lots99],
    },
    humanValidationRequired: true,
    productionReady: false,
  };
}
