export type ConcessionSubtype = "SERVICE_CONCESSION" | "WORKS_CONCESSION";

export interface ConcessionRealCaseEvidence {
  id:string; subtype:ConcessionSubtype; contractingAuthority:string; title:string; sourceUrl:string;
  hasPcap:boolean; hasPpt:boolean; hasMemory:boolean; hasViabilityStudy:boolean; viabilityApproved:boolean;
  hasProjectDocumentation?:boolean; editableBinaryVerified:false; generalizable:false;
}

/** Casos reales son autoridad de contraste/regresión, nunca plantillas generales. */
export const LB98_CONCESSION_REAL_CASES:readonly ConcessionRealCaseEvidence[]=[
  {id:"JDA-SAS-PUERTO-REAL-CAFETERIA-CONCESSION-2021",subtype:"SERVICE_CONCESSION",contractingAuthority:"Servicio Andaluz de Salud",title:"Concesión de servicio de cafetería del Hospital Universitario de Puerto Real y máquinas expendedoras",sourceUrl:"https://www.juntadeandalucia.es/contratacion/document/ContractNoticeDetail.action?code=2022-0000001278&lite=N&request_locale=es",hasPcap:true,hasPpt:true,hasMemory:true,hasViabilityStudy:true,viabilityApproved:true,editableBinaryVerified:false,generalizable:false},
  {id:"JDA-SAS-NUEVO-HOSPITAL-MALAGA-PARKING-WORKS-CONCESSION-2025",subtype:"WORKS_CONCESSION",contractingAuthority:"Servicio Andaluz de Salud",title:"Concesión de obras de los aparcamientos incluida en la contratación del nuevo Hospital de Málaga",sourceUrl:"https://www.juntadeandalucia.es/boja/2025/104/s54",hasPcap:false,hasPpt:false,hasMemory:true,hasViabilityStudy:true,viabilityApproved:true,hasProjectDocumentation:true,editableBinaryVerified:false,generalizable:false},
] as const;

export function evaluateConcessionPhysicalBaseline(){
  const completeRealServiceCase=LB98_CONCESSION_REAL_CASES.some(item=>item.subtype==="SERVICE_CONCESSION"&&item.hasPcap&&item.hasPpt&&item.hasMemory&&item.hasViabilityStudy&&item.viabilityApproved);
  const worksViabilityCase=LB98_CONCESSION_REAL_CASES.some(item=>item.subtype==="WORKS_CONCESSION"&&item.hasViabilityStudy&&item.viabilityApproved&&item.hasProjectDocumentation);
  return{
    block:"LB98" as const,
    objective:"VERTICAL_CONCESSION_PHYSICAL_OPERATIONAL" as const,
    legalSourceCoverage:true,
    completeRealCaseLocated:completeRealServiceCase,
    worksConcessionViabilityCaseLocated:worksViabilityCase,
    generalOfficialTemplateAvailable:false,
    serviceConcessionPhysicalProfileAvailable:true,
    worksConcessionPhysicalProfileAvailable:true,
    riskOperationalGateRequired:true,
    viabilityGateRequired:true,
    physicalPackageOperational:false,
    engineeringClosed:false,
    productionReady:false as const,
    humanValidationRequired:true as const,
    cases:LB98_CONCESSION_REAL_CASES,
    blockers:[
      "No existe en el catálogo vigente de modelos recomendados de la Junta una familia general de PCAP de concesiones comparable a Supply/Service/Works.",
      "Los casos reales Puerto Real y Málaga son autoridad de contraste; no se promocionan como plantillas generales ni oficiales.",
      "Los perfiles físicos Service Concession y Works Concession son derivados de Contrata-IA y su uso queda condicionado a riesgo operacional, viabilidad, preparación específica del subtipo y validación humana.",
    ],
  };
}
