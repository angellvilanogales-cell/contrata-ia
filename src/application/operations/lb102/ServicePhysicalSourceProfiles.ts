export type ServicePhysicalDocumentKind="PCAP"|"MEMORIA"|"PPT";
export type ServicePilotSourceId="service-huelva"|"service-5g";

export interface ServicePhysicalDocumentProfile{
 readonly kind:ServicePhysicalDocumentKind;
 readonly primarySourceAvailable:boolean;
 readonly sourcePages:number|null;
 readonly sourceLabel:string;
 readonly requiredMarkers:readonly string[];
 readonly sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE";
 readonly neverGeneralModel:true;
}

export interface ServicePhysicalCaseProfile{
 readonly id:ServicePilotSourceId;
 readonly caseId:string;
 readonly title:string;
 readonly documents:Readonly<Record<ServicePhysicalDocumentKind,ServicePhysicalDocumentProfile>>;
}

/**
 * Evidencia física primaria localizada en las fuentes del proyecto.
 * Los expedientes reales se usan exclusivamente para regresión/comparación;
 * nunca se promocionan automáticamente a modelo general Service.
 */
export const LB102_SERVICE_PHYSICAL_SOURCE_PROFILES:Readonly<Record<ServicePilotSourceId,ServicePhysicalCaseProfile>>={
 "service-huelva":{
  id:"service-huelva",caseId:"CONTR 2025 468715",
  title:"Servicios de limpieza para oficinas/centros de empleo de Ayamonte, Lepe, Isla Cristina y Puebla de Guzmán",
  documents:{
   MEMORIA:{kind:"MEMORIA",primarySourceAvailable:true,sourcePages:13,sourceLabel:"NJyGwcUKTjpD4K5aFCS2n508xyU0F6.pdf",requiredMarkers:["MEMORIA JUSTIFICATIVA DE LA NECESIDAD DE LA CONTRATACIÓN","CONTR 2025 468715","174.582,58"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
   PCAP:{kind:"PCAP",primarySourceAvailable:true,sourcePages:103,sourceLabel:"ilovepdf_merged 4 PCAP (1).pdf · páginas físicas 225-327",requiredMarkers:["PROCEDIMIENTO ABIERTO","CONTR 2025 468715","PCAP Servicios Abierto. Presentación electrónica de ofertas"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
   PPT:{kind:"PPT",primarySourceAvailable:true,sourcePages:28,sourceLabel:"NJyGw4ws4k0mCIGhAj95222851U6Md.pdf",requiredMarkers:["PLIEGO DE PRESCRIPCIONES TÉCNICAS","AYAMONTE","ISLA CRISTINA","PUEBLA DE GUZMÁN"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
  },
 },
 "service-5g":{
  id:"service-5g",caseId:"CONTR/2023/957915",
  title:"Servicios para la impartición de acciones formativas sobre nuevas tecnologías a desplegar sobre entornos 5G",
  documents:{
   MEMORIA:{kind:"MEMORIA",primarySourceAvailable:false,sourcePages:null,sourceLabel:"ilovepdf_merged 4 memorias.pdf · solo diligencia de aprobación localizada",requiredMarkers:["CONTR/2023/957915","5G"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
   PCAP:{kind:"PCAP",primarySourceAvailable:true,sourcePages:111,sourceLabel:"ilovepdf_merged 4 PCAP (1).pdf · páginas físicas 114-224",requiredMarkers:["CONTR/2023/957915","PROCEDIMIENTO ABIERTO","80530000-8","PÁGINA  1 / 111"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
   PPT:{kind:"PPT",primarySourceAvailable:true,sourcePages:50,sourceLabel:"ilovepdf_merged 4 PPT.pdf · bloque 5G de 50 páginas",requiredMarkers:["CONTR 2023 957915","80530000-8","Pliego de Prescripciones Técnicas","PÁGINA: 1 / 50"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
  },
 },
} as const;

export function servicePhysicalSourceBlockers(id:ServicePilotSourceId):readonly string[]{
 const profile=LB102_SERVICE_PHYSICAL_SOURCE_PROFILES[id];
 return Object.values(profile.documents).filter(d=>!d.primarySourceAvailable).map(d=>`${id}/${d.kind}: no se ha localizado una fuente primaria independiente completa; ${d.sourceLabel}.`);
}

export function servicePhysicalSourceCoverage(id:ServicePilotSourceId){
 const profile=LB102_SERVICE_PHYSICAL_SOURCE_PROFILES[id];
 const documents=Object.values(profile.documents);const available=documents.filter(d=>d.primarySourceAvailable).length;
 return{available,total:documents.length,complete:available===documents.length,blockers:servicePhysicalSourceBlockers(id)} as const;
}
