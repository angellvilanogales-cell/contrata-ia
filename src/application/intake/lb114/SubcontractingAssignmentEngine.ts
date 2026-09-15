export const LB114_SUBCONTRACTING_ASSIGNMENT_VERSION="LB114-SUBCONTRACTING-ASSIGNMENT-V1" as const;
const LCSP="https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902";
export interface SubcontractingAssignmentInput {contractType:"SUPPLY"|"SERVICE";supplyIncludesInstallationOrServices:boolean;secretOrSecurityContract:boolean;requireOfferDisclosure:boolean;criticalTasks:readonly {task:string;reason:string}[];estimatedValueCents:number;expectedSubcontractingPercent:number;contractorQualitiesDecisive:boolean;assignmentWouldRestrictCompetition:boolean}
interface Basis{id:string;article:string;paragraph:string;relevantOfficialExcerpt:string;officialUrl:string}
export interface SubcontractingAssignmentResult {version:typeof LB114_SUBCONTRACTING_ASSIGNMENT_VERSION;subcontractingRegime:string;criticalTasksRegime:string;offerDisclosureRegime:string;communicationRegime:string;paymentControlRegime:string;assignmentRegime:string;assignmentRequirements:string;documentaryStatements:readonly {element:string;status:"APPLIES"|"NOT_APPLICABLE";text:string;destinations:readonly ("MEMORY"|"PCAP"|"PPT")[]}[];legalBasis:readonly Basis[];warnings:readonly string[];humanValidationRequired:true;generationBlocked:true;productionReady:false}
const basis=(id:string,article:string,paragraph:string,text:string):Basis=>({id,article,paragraph,relevantOfficialExcerpt:text,officialUrl:`${LCSP}#a${article}`});
const LEGAL=[
 basis("LCSP-214.1","214","1","La cesión solo puede producirse cuando el pliego la contemple de forma inequívoca y no altere sustancialmente las características del contratista determinantes de la adjudicación."),
 basis("LCSP-214.2","214","2","La cesión exige autorización previa y expresa, ejecución mínima cuando proceda, aptitud del cesionario y formalización en escritura pública."),
 basis("LCSP-215.1","215","1","El contratista podrá concertar con terceros la realización parcial de la prestación con sujeción a lo dispuesto en los pliegos, salvo prestaciones de ejecución directa."),
 basis("LCSP-215.2.a","215","2.a","El pliego podrá exigir que la oferta indique la parte que se prevé subcontratar y el nombre o perfil empresarial de los subcontratistas."),
 basis("LCSP-215.2.b","215","2.b","El contratista deberá comunicar por escrito la intención de celebrar subcontratos, identificar al subcontratista y justificar suficientemente su aptitud."),
 basis("LCSP-215.2.e","215","2.e","Determinadas tareas críticas pueden quedar sujetas a ejecución directa cuando se identifiquen y justifiquen en el expediente."),
 basis("LCSP-215.4","215","4","El contratista principal asumirá la total responsabilidad de la ejecución frente a la Administración."),
 basis("LCSP-217.1","217","1","El órgano de contratación podrá comprobar el estricto cumplimiento de los pagos a subcontratistas y suministradores."),
 basis("LCSP-217.2","217","2","La comprobación es obligatoria en determinados contratos de obras y servicios cuyo valor estimado supere cinco millones de euros y la subcontratación alcance al menos el treinta por ciento."),
] as const;
const clean=(v:string,label:string)=>{const x=String(v||"").trim();if(!x)throw new Error(`Falta ${label}.`);return x;};
export function evaluateSubcontractingAssignment(i:SubcontractingAssignmentInput):SubcontractingAssignmentResult{
 if(!["SUPPLY","SERVICE"].includes(i.contractType))throw new Error("Tipo contractual no admitido.");
 if(!Number.isInteger(i.estimatedValueCents)||i.estimatedValueCents<0)throw new Error("El valor estimado debe expresarse en céntimos y no puede ser negativo.");
 if(!Number.isFinite(i.expectedSubcontractingPercent)||i.expectedSubcontractingPercent<0||i.expectedSubcontractingPercent>100)throw new Error("El porcentaje previsto de subcontratación debe estar entre 0 y 100.");
 const canCritical=i.contractType==="SERVICE"||(i.contractType==="SUPPLY"&&i.supplyIncludesInstallationOrServices);
 if(i.criticalTasks.length&&!canCritical)throw new Error("En un suministro puro no pueden imponerse tareas críticas de ejecución directa por esta vía.");
 const seen=new Set<string>();const tasks=i.criticalTasks.map((x,n)=>{const task=clean(x.task,`la tarea crítica ${n+1}`),reason=clean(x.reason,`la justificación de la tarea crítica ${n+1}`);if(seen.has(task.toLowerCase()))throw new Error(`Tarea crítica duplicada: ${task}.`);seen.add(task.toLowerCase());return{task,reason};});
 const critical=tasks.length?`Deben ser ejecutadas directamente por el contratista principal: ${tasks.map(x=>`${x.task} (${x.reason})`).join("; ")}.`:`No se identifican tareas críticas reservadas a ejecución directa; rige la posibilidad legal de subcontratación parcial.`;
 const disclosure=i.requireOfferDisclosure?"La oferta deberá indicar la parte prevista para subcontratar, su importe y el nombre o perfil empresarial de los posibles subcontratistas.":"No se exige identificar en la oferta a los posibles subcontratistas; permanece la comunicación obligatoria previa a su intervención.";
 const communication=i.secretOrSecurityContract?"Todo subcontrato requerirá autorización expresa del órgano de contratación por tratarse de un contrato secreto, reservado o sujeto a medidas especiales de seguridad.":"Tras la adjudicación y, a más tardar, al inicio de la ejecución, se comunicará por escrito cada subcontrato, su objeto, identidad y aptitud del subcontratista, así como sus cambios.";
 const mandatoryPayment=i.contractType==="SERVICE"&&i.estimatedValueCents>500_000_000&&i.expectedSubcontractingPercent>=30;
 const payments=mandatoryPayment?"La Administración comprobará obligatoriamente los pagos a subcontratistas y suministradores, por superar el contrato de servicios 5.000.000 € de valor estimado y preverse al menos un 30 % de subcontratación.":"No concurre el supuesto obligatorio del artículo 217.2; el órgano de contratación conserva la facultad de comprobar los pagos a subcontratistas y suministradores.";
 const assignmentAllowed=!i.contractorQualitiesDecisive&&!i.assignmentWouldRestrictCompetition;
 const assignment=assignmentAllowed?"Se admite la cesión contractual de forma inequívoca, condicionada al cumplimiento íntegro de los requisitos del artículo 214 LCSP.":"No se admite la cesión porque las cualidades técnicas o personales del cedente son determinantes de la adjudicación o porque produciría una restricción efectiva de la competencia; esta causa debe quedar motivada en el expediente.";
 const requirements=assignmentAllowed?"Autorización previa y expresa; ejecución mínima legal cuando resulte exigible; capacidad, solvencia o clasificación y ausencia de prohibición del cesionario; formalización en escritura pública.":"No aplican requisitos operativos de cesión al quedar ésta excluida por la causa validada, sin perjuicio de documentar expresamente dicha causa.";
 const subcontract="Se permite la subcontratación parcial conforme al PCAP y a los artículos 215 a 217 LCSP. El contratista principal conserva la responsabilidad total frente a la Administración.";
 return{version:LB114_SUBCONTRACTING_ASSIGNMENT_VERSION,subcontractingRegime:subcontract,criticalTasksRegime:critical,offerDisclosureRegime:disclosure,communicationRegime:communication,paymentControlRegime:payments,assignmentRegime:assignment,assignmentRequirements:requirements,documentaryStatements:[
  {element:"SUBCONTRACTING_GENERAL",status:"APPLIES",text:subcontract,destinations:["MEMORY","PCAP"]},
  {element:"CRITICAL_TASKS",status:tasks.length?"APPLIES":"NOT_APPLICABLE",text:critical,destinations:["MEMORY","PCAP","PPT"]},
  {element:"OFFER_DISCLOSURE",status:i.requireOfferDisclosure?"APPLIES":"NOT_APPLICABLE",text:disclosure,destinations:["PCAP"]},
  {element:"COMMUNICATION_OR_AUTHORIZATION",status:"APPLIES",text:communication,destinations:["PCAP"]},
  {element:"PAYMENT_CONTROL",status:mandatoryPayment?"APPLIES":"NOT_APPLICABLE",text:payments,destinations:["MEMORY","PCAP"]},
  {element:"ASSIGNMENT",status:assignmentAllowed?"APPLIES":"NOT_APPLICABLE",text:`${assignment} ${requirements}`,destinations:["MEMORY","PCAP"]},
 ],legalBasis:LEGAL,warnings:["La subcontratación y la cesión son instituciones distintas y deben constar por separado.","No se incorpora ninguna restricción ni tarea crítica sin hechos y motivación validados por la persona responsable."],humanValidationRequired:true,generationBlocked:true,productionReady:false};
}
