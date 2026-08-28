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

/** Corpus real LB102: solo hechos expresamente acreditados; nunca completa huecos por analogía. */
export const LB102_REAL_CASE_CORPUS:readonly RealCaseRegressionEntry[]=[
  {
    registryId:"REG-SUPPLY-001",caseId:"CONTR/2026/240267",family:"SUPPLY",
    procedure:"ABIERTO_SIMPLIFICADO_ABREVIADO",sourceAuthority:"SAE_FERRETERIA_MEMORIA_PCAP_PPT",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"FULL_PIPELINE",neverGeneralModel:true,
    invariants:{subfamily:"SUCCESSIVE_NEEDS_CATALOG",needsBased:true,da33:true,catalogClosed:true},openIssues:[]
  },
  {
    registryId:"REG-SUPPLY-002",caseId:"CONTR 2025 466864",family:"SUPPLY",
    procedure:"ABIERTO_SIMPLIFICADO_ORDINARIO",sourceAuthority:"PANDA_ANTIVIRUS_MEMORIA_PCAP_PPT_FIRMADOS",
    sourceDocuments:["MEMORY","PCAP","PPT"],physicalCoverage:"FULL_PIPELINE",neverGeneralModel:true,
    invariants:{subfamily:"SOFTWARE_LICENSE",cpvMain:"48760000-3",divisionIntoLots:false,durationMonths:36,extensionMonths:0,baseTenderBudgetCents:6119225,vatIncludedBudgetCents:7404262,estimatedValueCents:6119225,unitPrices:true,da33:false,partnerGoldRequired:true},
    openIssues:[]
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
    openIssues:["Los PENDING_SOURCE_EVIDENCE no pueden convertirse en reglas congeladas.","La fuente caracteriza el contrato como mixto 90 % servicios / 10 % suministros accesorios con prestación principal servicios; no debe degradarse a servicio puro."]
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
