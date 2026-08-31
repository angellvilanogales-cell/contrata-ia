export type PandaDocumentKind="MEMORIA"|"PCAP"|"PPT";

export interface PandaPhysicalSourceDocumentProfile{
 readonly kind:PandaDocumentKind;
 readonly sourceLabel:string;
 readonly sourcePages:number;
 readonly requiredHeadings:readonly string[];
 readonly requiredMarkers:readonly string[];
 readonly forbiddenMarkers:readonly string[];
 readonly sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE";
 readonly neverGeneralModel:true;
}

/**
 * Perfil físico extraído de los tres documentos primarios del expediente
 * CONTR 2025 466864. Es evidencia de regresión y de comparación física: no es
 * por sí mismo un modelo general ni autoriza a reutilizar datos del expediente.
 */
export const LB102_PANDA_PHYSICAL_SOURCE_PROFILE:Readonly<Record<PandaDocumentKind,PandaPhysicalSourceDocumentProfile>>={
 MEMORIA:{
  kind:"MEMORIA",
  sourceLabel:"06 Memoria Panda antivirus.pdf",
  sourcePages:5,
  requiredHeadings:[
   "1. NATURALEZA Y OBJETO DEL CONTRATO",
   "2. TIPO DE CONTRATO",
   "3. NECESIDAD E IDONEIDAD DE LA CONTRATACIÓN",
   "4. FRACCIONAMIENTO DEL OBJETO DEL CONTRATO EN LOTES",
   "5. TRAMITACIÓN Y PROCEDIMIENTO DE LICITACIÓN",
   "6. PLAZO DE DURACIÓN Y POSIBILIDAD DE PRÓRROGA",
   "7. PRESUPUESTO DE LICITACIÓN Y VALOR ESTIMADO DEL CONTRATO",
   "8. PRESUPUESTO PRINEX",
   "9. ÓRGANO DE CONTRATACIÓN",
   "10. CRITERIOS DE SOLVENCIA ECONÓMICO Y FINANCIERA, TÉCNICA Y PROFESIONAL",
   "11. CRITERIOS DE ADJUDICACIÓN",
   "12. CONDICIONES ESPECIALES DE EJECUCIÓN",
   "13. INNECESARIA FISCALIZACIÓN PREVIA DEL EXPEDIENTE",
   "14. SOLICITUD DE INFORME PRECEPTIVO PREVIO A LA CONTRATACIÓN",
  ],
  requiredMarkers:["CONTR 2025 466864","48760000-3","Panda Security","Página de 1 de 5"],
  forbiddenMarkers:["{{caseId}}","{{need}}","{{object}}","{{cpvMain}}","CONTRATA-IA","DATOS VARIABLES DEL EXPEDIENTE"],
  sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true,
 },
 PCAP:{
  kind:"PCAP",
  sourceLabel:"06 PCAP Panda antivirus.pdf",
  sourcePages:85,
  requiredHeadings:[
   "I. ELEMENTOS DEL CONTRATO",
   "II. ADJUDICACIÓN DEL CONTRATO",
   "III. EJECUCIÓN DEL CONTRATO",
   "IV. EXTINCIÓN DEL CONTRATO",
   "1. Régimen jurídico del contrato",
   "2. Objeto del contrato",
   "3. Presupuesto base de licitación, valor estimado y precio del contrato",
   "8. Procedimiento de adjudicación y tramitación del expediente",
   "10. Selección de la persona contratista, adjudicación y formalización",
   "12. Ejecución del contrato",
   "18. Entrega de bienes y recepción del objeto del contrato",
   "22. Modificación del contrato",
   "25. Jurisdicción competente y recursos",
  ],
  requiredMarkers:[
   "MODELO DE PLIEGO DE CLÁUSULAS ADMINISTRATIVAS PARTICULARES RECOMENDADO POR LA COMISIÓN CONSULTIVA DE CONTRATACIÓN PÚBLICA",
   "PROCEDIMIENTO ABIERTO SIMPLIFICADO ORDINARIO",
   "PRESENTACIÓN ELECTRÓNICA DE OFERTAS",
   "CONTR 2025 466864",
   "SEVILLA",
  ],
  forbiddenMarkers:["{{caseId}}","{{title}}","{{object}}","CONTRATA-IA","DATOS VARIABLES DEL EXPEDIENTE"],
  sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true,
 },
 PPT:{
  kind:"PPT",
  sourceLabel:"06 PPT Panda antivirus.pdf",
  sourcePages:16,
  requiredHeadings:[
   "1 INTRODUCCIÓN",
   "2 ALCANCE DE LOS TRABAJOS",
   "3 CARACTERÍSTICAS TÉCNICAS",
   "3.1 Protección de equipos de la Agencia",
   "3.2 Soporte técnico 24x7 y revisión anual de fabricante",
   "4 CONDICIONES GENERALES",
   "4.1 Medios materiales",
   "4.2 Metodología",
   "4.3 Productos",
   "4.4 Garantía",
   "4.5 Lugar de realización de los trabajos",
   "4.6 Propiedad del resultado de los trabajos",
   "4.7 Información de base",
   "4.8 Utilización de NAOS",
   "4.9 Confidencialidad de la información",
   "4.10 Tratamiento de Datos Personales",
   "4.11 Seguridad",
  ],
  requiredMarkers:["CONTR 2025 466864","PANDA SECURITY","Sección de Informática y Sistemas","Página 2 de 16"],
  forbiddenMarkers:["{{caseId}}","{{object}}","{{technicalRequirements}}","CONTRATA-IA","DATOS VARIABLES DEL EXPEDIENTE"],
  sourceRole:"VALIDATED_REAL_CASE_REGRESSION_SOURCE",neverGeneralModel:true,
 },
} as const;

export interface PandaPhysicalComparisonInput{kind:PandaDocumentKind;pageCount:number;text:string;}
export interface PandaPhysicalComparisonResult{kind:PandaDocumentKind;passed:boolean;pageCountMatched:boolean;missingHeadings:readonly string[];missingMarkers:readonly string[];forbiddenMarkersFound:readonly string[];blockers:readonly string[];}

function normalize(value:string){return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toLowerCase();}

export function comparePandaAgainstPhysicalSource(input:PandaPhysicalComparisonInput):PandaPhysicalComparisonResult{
 const profile=LB102_PANDA_PHYSICAL_SOURCE_PROFILE[input.kind];
 const normalized=normalize(input.text);
 const missingHeadings=profile.requiredHeadings.filter(x=>!normalized.includes(normalize(x)));
 const missingMarkers=profile.requiredMarkers.filter(x=>!normalized.includes(normalize(x)));
 const forbiddenMarkersFound=profile.forbiddenMarkers.filter(x=>normalized.includes(normalize(x)));
 const pageCountMatched=input.pageCount===profile.sourcePages;
 const blockers:string[]=[];
 if(!pageCountMatched)blockers.push(`${input.kind}: profundidad física ${input.pageCount} páginas; fuente ${profile.sourcePages}.`);
 for(const x of missingHeadings)blockers.push(`${input.kind}: falta epígrafe fuente «${x}».`);
 for(const x of missingMarkers)blockers.push(`${input.kind}: falta marcador físico «${x}».`);
 for(const x of forbiddenMarkersFound)blockers.push(`${input.kind}: contiene marcador impropio/no resuelto «${x}».`);
 return{kind:input.kind,passed:blockers.length===0,pageCountMatched,missingHeadings,missingMarkers,forbiddenMarkersFound,blockers};
}
