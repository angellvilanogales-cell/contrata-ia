import { UniversalCapability } from "./UniversalContractCoverage";

export type ReuseDisposition =
  | "REUSE"
  | "REUSE_WITH_BOUNDARY"
  | "KNOWLEDGE_ONLY"
  | "SPECIALIZED_REFERENCE"
  | "MISSING_UNIVERSAL_COMPONENT";

export interface RepositoryCapabilityInventoryItem {
  capability: UniversalCapability;
  disposition: ReuseDisposition;
  existingAssets: readonly string[];
  universalComponent?: string;
  constraints: readonly string[];
}

/**
 * Inventario LB91.3+: describe qué hay ya en el repositorio antes de crear nuevos motores.
 * No confunde un catálogo de reglas o un motor especializado con un motor universal validado.
 */
export const REPOSITORY_CAPABILITY_INVENTORY: readonly RepositoryCapabilityInventoryItem[] = [
  {
    capability: "OBJECT_AND_NEED",
    disposition: "REUSE",
    existingAssets: ["src/engines/ObjetoEngine.ts", "knowledge/rules/objeto.rules.json"],
    universalComponent: "ObjetoEngine",
    constraints: ["La decisión sobre lotes permanece separada y requiere hechos/motivación del expediente."],
  },
  {
    capability: "CPV",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/CPVEngine.ts", "src/domain/cpv/CPVMatcher.ts"],
    universalComponent: "CPVEngine",
    constraints: ["Clasificación léxica local; propuesta siempre sujeta a validación humana."],
  },
  {
    capability: "LOTS",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/UniversalLotsEngine.ts", "src/application/normative/LB4CleaningServiceEngine.ts", "src/domain/expediente/UniversalExpedienteV13.ts"],
    universalComponent: "UniversalLotsEngine",
    constraints: ["No fabrica motivación de no división y distingue el subtipo de concesión antes de aplicar reglas."],
  },
  {
    capability: "ECONOMICS",
    disposition: "REUSE",
    existingAssets: ["src/engines/UniversalEconomicEngine.ts"],
    universalComponent: "UniversalEconomicEngine",
    constraints: ["Debe ampliarse por familias sin alterar semánticas ya protegidas de PBL, VE, DA33, prórrogas y modificaciones."],
  },
  {
    capability: "PROCEDURE",
    disposition: "REUSE",
    existingAssets: ["src/engines/ProcedimientoEngine.ts", "knowledge/rules/procedimiento.rules.json"],
    universalComponent: "ProcedimientoEngine",
    constraints: ["No ejecutar cuando falten condiciones jurídicas necesarias; toda propuesta permanece validable humanamente."],
  },
  {
    capability: "SOLVENCY",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/SolvenciaEngine.ts", "knowledge/rules/solvencia.rules.json", "knowledge/rules/solvencia.rules.yaml"],
    universalComponent: "SolvenciaEngine",
    constraints: ["No fabricar medios/umbrales concretos salvo conclusión legal cerrada; la configuración del expediente es humana."],
  },
  {
    capability: "PUBLICITY",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/PublicidadEngine.ts", "knowledge/rules/publicidad.rules.json"],
    universalComponent: "PublicidadEngine",
    constraints: ["Distinguir obligación jurídica de publicidad de la plataforma institucional concreta."],
  },
  {
    capability: "AWARD_CRITERIA",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/UniversalAwardCriteriaEngine.ts", "knowledge/rules/criterios.rules.yaml", "src/application/normative/LB4CleaningServiceEngine.ts"],
    universalComponent: "UniversalAwardCriteriaEngine",
    constraints: ["Valida criterios aportados por el expediente; no inventa criterios, ponderaciones ni fórmulas."],
  },
  {
    capability: "GUARANTEES",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/UniversalGuaranteeEngine.ts", "src/application/normative/LB4CleaningServiceEngine.ts"],
    universalComponent: "UniversalGuaranteeEngine",
    constraints: ["Distingue Administración Pública, concesiones, ASA, acuerdos marco/SDA y excepciones; validación humana obligatoria."],
  },
  {
    capability: "EXECUTION",
    disposition: "KNOWLEDGE_ONLY",
    existingAssets: ["knowledge/rules/ejecucion.rules.yaml", "src/application/normative/LB4CleaningServiceEngine.ts"],
    constraints: ["Hay catálogo y lógica especializada; falta motor universal para condiciones, penalidades, subcontratación y datos."],
  },
  {
    capability: "MODIFICATIONS",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/UniversalModificationEngine.ts", "src/engines/UniversalEconomicEngine.ts", "src/domain/expediente/UniversalExpedienteV13.ts", "protected supply DA33 pipeline"],
    universalComponent: "UniversalModificationEngine",
    constraints: ["El art. 205 nunca se autocierra; la DA33 mantiene sus guardas y no se extrapola a otras familias."],
  },
  {
    capability: "PRICE_REVISION",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/UniversalPriceRevisionEngine.ts", "src/domain/expediente/UniversalExpedienteV13.ts"],
    universalComponent: "UniversalPriceRevisionEngine",
    constraints: ["Evalúa procedencia abstracta y guardas; no fabrica fórmula ni índice oficial."],
  },
  {
    capability: "REMEDIES",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/UniversalRemediesEngine.ts"],
    universalComponent: "UniversalRemediesEngine",
    constraints: ["Cubre ámbito contractual del recurso especial; acto recurrible, legitimación, plazo y órgano quedan fuera hasta su módulo específico."],
  },
  {
    capability: "DOCUMENT_MODEL_SELECTION",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/CanonicalDocumentProfileSelector.ts", "src/domain/documentModel/ContractDocumentModelProfile.ts"],
    universalComponent: "CanonicalDocumentProfileSelector",
    constraints: ["Un perfil real solo puede generar si sus activos/modelos están registrados y aprobados."],
  },
  {
    capability: "EDITABLE_DOCUMENT_GENERATION",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["src/engines/UniversalDocumentGenerationGate.ts", "protected supply ODT renderers", "LB5/LB6 document pipeline"],
    universalComponent: "UniversalDocumentGenerationGate",
    constraints: ["El pipeline protegido de suministro es referencia de calidad, no cobertura automática para otras familias."],
  },
  {
    capability: "CROSS_DOCUMENT_AUDIT",
    disposition: "REUSE_WITH_BOUNDARY",
    existingAssets: ["protected supply package cross audit", "canonical/universal document gates"],
    constraints: ["Debe generalizarse a Memoria-PCAP-PPT sin rebajar los controles protegidos existentes."],
  },
] as const;

export function getCapabilityInventory(capability: UniversalCapability): RepositoryCapabilityInventoryItem {
  const item = REPOSITORY_CAPABILITY_INVENTORY.find(candidate => candidate.capability === capability);
  if (!item) throw new Error(`Capacidad no inventariada: ${capability}`);
  return item;
}

export function getMissingUniversalCapabilities(): readonly RepositoryCapabilityInventoryItem[] {
  return REPOSITORY_CAPABILITY_INVENTORY.filter(item =>
    item.disposition === "MISSING_UNIVERSAL_COMPONENT"
    || item.disposition === "KNOWLEDGE_ONLY"
    || item.disposition === "SPECIALIZED_REFERENCE"
  );
}
