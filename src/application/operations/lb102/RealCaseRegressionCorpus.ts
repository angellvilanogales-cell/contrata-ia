export type RealCaseFamily="SUPPLY"|"SERVICE";
export type RealCaseDocument="MEMORY"|"PCAP"|"PPT";
export type PhysicalCoverage="FULL_PIPELINE"|"SOURCE_COMPLETE_PROFILE_PENDING"|"SOURCE_PARTIAL";

export interface RealCaseRegressionEntry{
  readonly registryId:string;
  readonly caseId:string;
  readonly family:RealCaseFamily;
  readonly procedure:string;
  readonly sourceAuthority:string;
  readonly sourceDocuments:readonly RealCaseDocument[];
  readonly physicalCoverage:PhysicalCoverage;
  readonly neverGeneralModel:true;
  readonly invariants:Readonly<Record<string,string|number|boolean>>;
  readonly openIssues:readonly string[];
}

/**
 * Corpus de expedientes reales para LB102. Cada entrada conserva únicamente hechos
 * acreditados por las fuentes del proyecto; no completa huecos por analogía.
 */
export const LB102_REAL_CASE_CORPUS:readonly RealCaseRegressionEntry[]=[
  {
    registryId:"REG-SUPPLY-001",caseId:"CONTR/2026/240267",family:"SUPPLY",
    procedure:"ABIERTO_SIMPLIFICADO_ABREVIADO",sourceAuthority:"SAE_FERRETERIA_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"FULL_PIPELINE",neverGeneralModel:true,
    invariants:{subfamily:"SUCCESSIVE_NEEDS_CATALOG",needsBased:true,da33:true,catalogClosed:true},openIssues:[]
  },
  {
    registryId:"REG-SUPPLY-002",caseId:"CONTR 2025 466864",family:"SUPPLY",
    procedure:"ABIERTO_SIMPLIFICADO_ORDINARIO",sourceAuthority:"PANDA_ANTIVIRUS_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"SOURCE_COMPLETE_PROFILE_PENDING",neverGeneralModel:true,
    invariants:{subfamily:"SOFTWARE_LICENSE",lots:6,divisionIntoLots:true,osl:true,da33:false},
    openIssues:["El perfil físico Supply ASO debe ser independiente del PCAP ASA."]
  },
  {
    registryId:"REG-SUPPLY-003",caseId:"CONTR 2025 0000489703",family:"SUPPLY",
    procedure:"SOURCE_DECLARED",sourceAuthority:"AULAS_DIGITALES_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"SOURCE_COMPLETE_PROFILE_PENDING",neverGeneralModel:true,
    invariants:{subfamily:"DIGITAL_EQUIPMENT",da33:false},openIssues:["Seleccionar perfil físico compatible con el procedimiento acreditado en fuente."]
  },
  {
    registryId:"REG-SUPPLY-004",caseId:"470/2025",family:"SUPPLY",
    procedure:"SOURCE_DECLARED",sourceAuthority:"SAS_NEBULIZACION_OXIGENOTERAPIA_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"SOURCE_COMPLETE_PROFILE_PENDING",neverGeneralModel:true,
    invariants:{subfamily:"HEALTH_FRAMEWORK_AGREEMENT",sanitary:true,da33:false},openIssues:["Seleccionar perfil físico compatible con el procedimiento/acuerdo marco de la fuente."]
  },
  {
    registryId:"REG-SUPPLY-005",caseId:"CONTR 2024 0001239412",family:"SUPPLY",
    procedure:"SOURCE_DECLARED",sourceAuthority:"TABLETS_PLATAFORMA_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"SOURCE_COMPLETE_PROFILE_PENDING",neverGeneralModel:true,
    invariants:{subfamily:"SUPPLY_PLUS_PLATFORM_SERVICE",platformComponent:true,da33:false},openIssues:["No recalificar automáticamente como servicio o mixto."]
  },
  {
    registryId:"REG-SERVICE-005",caseId:"CONTR/2024/636510",family:"SERVICE",
    procedure:"ABIERTO_SIMPLIFICADO_ORDINARIO",sourceAuthority:"CARL_LIMPIEZA_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"SOURCE_COMPLETE_PROFILE_PENDING",neverGeneralModel:true,
    invariants:{serviceVariant:"CLEANING",cpvMain:"90919200-4",insufficiencyOwnMeans:true,subrogation:true,sara:false},
    openIssues:["Los PENDING_SOURCE_EVIDENCE no pueden convertirse en reglas congeladas."]
  },
  {
    registryId:"REG-SERVICE-007",caseId:"REG-SERVICE-007_MAINTENANCE_SEVILLE",family:"SERVICE",
    procedure:"ABIERTO",sourceAuthority:"SAE_MANTENIMIENTO_SEVILLA_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"SOURCE_COMPLETE_PROFILE_PENDING",neverGeneralModel:true,
    invariants:{serviceVariant:"MAINTENANCE",lots:4,sara:true,insufficiencyOwnMeans:true,gmao:true,estimatedValueDeclaredCents:182399114},
    openIssues:["SOURCE_CONFLICT: límite de lotes por licitador.","Preservar diferencias de redondeo declaradas por la fuente."]
  }
] as const;

export function findRealCase(registryId:string):RealCaseRegressionEntry|undefined{return LB102_REAL_CASE_CORPUS.find(x=>x.registryId===registryId);}
export function packageCompleteInSource(entry:RealCaseRegressionEntry):boolean{return ["MEMORY","PCAP","PPT"].every(x=>entry.sourceDocuments.includes(x as RealCaseDocument));}
export function physicallyExecutableForPilot(entry:RealCaseRegressionEntry):boolean{return packageCompleteInSource(entry)&&entry.physicalCoverage==="FULL_PIPELINE";}
