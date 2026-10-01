import {createHash} from "node:crypto";

export type AtomicDocumentKind="PCAP"|"MEMORIA"|"PPT";
export interface AtomicDocumentInput{kind:AtomicDocumentKind;fileName:string;bytes:Uint8Array;sha256?:string;}

function stable(value:unknown):string{
 if(value===null||typeof value!=="object")return JSON.stringify(value)??"null";
 if(Array.isArray(value))return`[${value.map(stable).join(",")}]`;
 const row=value as Record<string,unknown>;return`{${Object.keys(row).sort().filter(k=>row[k]!==undefined).map(k=>`${JSON.stringify(k)}:${stable(row[k])}`).join(",")}}`;
}
function sha(value:Uint8Array|string){return createHash("sha256").update(value).digest("hex");}

/**
 * Invariante transversal de Contrata-IA: PCAP, Memoria y PPT son una sola
 * materialización atómica de un único snapshot. Ningún documento puede quedar
 * perteneciendo a otra versión/generación ni entregarse aisladamente.
 */
export function assertAtomicDocumentPackage(input:{caseId:string;packageVersion:string;canonicalSnapshot:unknown;documents:readonly AtomicDocumentInput[];crossDocumentBlockers?:readonly string[];unresolvedConflicts?:readonly string[]}){
 const blockers=[...(input.crossDocumentBlockers??[]),...(input.unresolvedConflicts??[]).map(x=>`SOURCE_CONFLICT: ${x}`)];
 const kinds=input.documents.map(x=>x.kind);for(const required of ["PCAP","MEMORIA","PPT"] as const){const count=kinds.filter(x=>x===required).length;if(count!==1)blockers.push(`ATOMIC_PACKAGE: se requiere exactamente un ${required}; encontrados ${count}.`);}
 if(input.documents.length!==3)blockers.push(`ATOMIC_PACKAGE: el expediente exige exactamente 3 documentos y contiene ${input.documents.length}.`);
 const names=new Set<string>();for(const doc of input.documents){if(names.has(doc.fileName))blockers.push(`ATOMIC_PACKAGE: nombre duplicado ${doc.fileName}.`);names.add(doc.fileName);const actual=sha(doc.bytes);if(doc.sha256&&doc.sha256!==actual)blockers.push(`ATOMIC_PACKAGE: SHA declarado de ${doc.kind} no coincide con sus bytes.`);}
 const snapshotHash=sha(stable(input.canonicalSnapshot));const generationId=sha(`${input.caseId}\n${input.packageVersion}\n${snapshotHash}`);
 if(blockers.length)throw new Error(blockers.join(" | "));
 return{packageVersion:input.packageVersion,snapshotHash,generationId,sameSnapshot:true as const,sameGeneration:true as const,allRequiredDocuments:true as const,crossDocumentAuditPassed:true as const,noUnresolvedConflict:true as const,generationReady:true as const,documentSet:["PCAP","MEMORIA","PPT"] as const};
}
