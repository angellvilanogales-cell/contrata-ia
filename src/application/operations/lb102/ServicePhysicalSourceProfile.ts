export type ServicePhysicalPilotId="service-huelva"|"service-5g";
export type ServicePhysicalDocumentKind="PCAP"|"MEMORIA"|"PPT";

export interface ServicePhysicalDocumentProfile{
 readonly kind:ServicePhysicalDocumentKind;
 readonly sourceLabel:string;
 readonly sourcePages:number|null;
 readonly requiredMarkers:readonly string[];
 readonly sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE";
 readonly neverGeneralModel:true;
}

export interface ServicePhysicalCaseProfile{
 readonly id:ServicePhysicalPilotId;
 readonly caseId:string;
 readonly documents:Readonly<Partial<Record<ServicePhysicalDocumentKind,ServicePhysicalDocumentProfile>>>;
 readonly fullyAccreditable:boolean;
 readonly blockers:readonly string[];
}

/**
 * Evidencia física primaria del corpus Service. Un expediente real se usa como
 * regresión/precedente, nunca como modelo general. Un null en sourcePages significa
 * que el documento primario no está todavía acreditado y bloquea la promoción.
 */
export const LB102_SERVICE_PHYSICAL_SOURCE_PROFILE:Readonly<Record<ServicePhysicalPilotId,ServicePhysicalCaseProfile>>={
 "service-huelva":{
  id:"service-huelva",caseId:"CONTR 2025 468715",fullyAccreditable:true,
  documents:{
   MEMORIA:{kind:"MEMORIA",sourceLabel:"NJyGwcUKTjpD4K5aFCS2n508xyU0F6.pdf",sourcePages:13,requiredMarkers:["MEMORIA JUSTIFICATIVA DE LA NECESIDAD DE LA CONTRATACIÓN","CONTR 2025 468715","SERVICIOS DE LIMPIEZA","Dirección Provincial de Huelva","PÁGINA: 1 / 13"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
   PCAP:{kind:"PCAP",sourceLabel:"ilovepdf_merged 4 PCAP (1).pdf · bloque físico 225-327",sourcePages:103,requiredMarkers:["CONTRATACIÓN DE SERVICIOS MEDIANTE PROCEDIMIENTO ABIERTO","CONTR 2025 468715","PCAP Servicios Abierto","PÁGINA 1 / 103"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
   PPT:{kind:"PPT",sourceLabel:"NJyGw4ws4k0mCIGhAj95222851U6Md.pdf",sourcePages:28,requiredMarkers:["PLIEGO DE PRESCRIPCIONES TÉCNICAS","SERVICIO DE LIMPIEZA","AYAMONTE","LEPE","ISLA CRISTINA","PUEBLA DE GUZMÁN"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
  },
  blockers:[],
 },
 "service-5g":{
  id:"service-5g",caseId:"CONTR/2023/957915",fullyAccreditable:false,
  documents:{
   PCAP:{kind:"PCAP",sourceLabel:"ilovepdf_merged 4 PCAP (1).pdf · bloque físico 114-224",sourcePages:111,requiredMarkers:["CONTRATACIÓN DE SERVICIOS MEDIANTE PROCEDIMIENTO ABIERTO","CONTR/2023/957915","ENTORNOS 5G","PCAP Servicios Abierto","PÁGINA 83 / 111"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
   PPT:{kind:"PPT",sourceLabel:"ilovepdf_merged 4 PPT.pdf · bloque físico 5G",sourcePages:50,requiredMarkers:["PLIEGO DE PRESCRIPCIONES TÉCNICAS","ACCIONES FORMATIVAS","ENTORNOS 5G","Pliego de Prescripciones Técnicas","PÁGINA: 29 / 50"],sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true},
  },
  blockers:["Memoria justificativa primaria de CONTR/2023/957915 no está todavía acreditada en el corpus como documento físico independiente; solo se ha localizado una diligencia de aprobación. No se puede promover el paquete completo solo con PCAP y PPT."],
 },
} as const;

export function servicePhysicalSourceBlockers(id:ServicePhysicalPilotId){
 const profile=LB102_SERVICE_PHYSICAL_SOURCE_PROFILE[id];
 const blockers=[...profile.blockers];
 for(const kind of ["PCAP","MEMORIA","PPT"] as const){
  const doc=profile.documents[kind];
  if(!doc||doc.sourcePages===null)blockers.push(`${id}: falta fuente física acreditada para ${kind}.`);
 }
 return blockers;
}

export function servicePhysicalSourceCoverage(id:ServicePhysicalPilotId){
 const profile=LB102_SERVICE_PHYSICAL_SOURCE_PROFILE[id];const kinds=["PCAP","MEMORIA","PPT"] as const;
 const available=kinds.filter(kind=>profile.documents[kind]?.sourcePages!==null&&profile.documents[kind]!==undefined).length;
 return{available,total:kinds.length,complete:available===kinds.length&&profile.blockers.length===0,blockers:servicePhysicalSourceBlockers(id)} as const;
}
