import type {IncomingMessage,ServerResponse} from "node:http";
import {persistLB102ProtectedSourcePackage} from "../../application/intake/lb102/LB102SourcePackageIngress";
import {lb102ProtectedSourceStatus,type LB102ProtectedSourceGroup} from "../../application/intake/lb102/LB102ProtectedSourceIngress";
import {SecurityPolicy} from "../lb7/SecurityPolicy";
import {createLB102RuntimeServer} from "./LB102RuntimeServer";
import {LB102_SOURCE_INGRESS_UI} from "./LB102SourceIngressUi";

function sendJson(r:ServerResponse,status:number,value:unknown){const bytes=Buffer.from(JSON.stringify(value));r.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":bytes.length,"cache-control":"no-store"});r.end(bytes);}
function sendHtml(r:ServerResponse,html:string){const bytes=Buffer.from(html);r.writeHead(200,{"content-type":"text/html; charset=utf-8","content-length":bytes.length,"cache-control":"no-store"});r.end(bytes);}
async function readBinary(request:IncomingMessage,maxBytes=5_000_000){const chunks:Buffer[]=[];let total=0;for await(const chunk of request){const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);total+=b.length;if(total>maxBytes)throw new Error("Paquete LB102 demasiado grande.");chunks.push(b);}if(total<100)throw new Error("Paquete ZIP vacío o inválido.");return Buffer.concat(chunks);}
async function statuses(){const groups:readonly LB102ProtectedSourceGroup[]=["ferreteria","panda","service-huelva","service-sevilla"];const out=[];for(const group of groups){try{out.push(await lb102ProtectedSourceStatus(group));}catch(error){out.push({group,ready:false,assets:[],blockers:[error instanceof Error?error.message:String(error)]});}}return out;}

/** Extensión estrecha del runtime LB102 para transportar un único ZIP binario desde navegador/cliente. */
export function createLB102RuntimeServerWithSourceIngress(){
 const server=createLB102RuntimeServer();const original=server.listeners("request");server.removeAllListeners("request");const security=new SecurityPolicy();
 server.on("request",async(request,response)=>{const url=new URL(request.url??"/","http://localhost");if(url.pathname!=="/lb102-source-ingress"&&url.pathname!=="/lb102-source-ingress/"&&url.pathname!=="/api/lb102/source-assets/package"){for(const listener of original)(listener as (req:IncomingMessage,res:ServerResponse)=>void)(request,response);return;}
  security.applySecurityHeaders(response);try{
   if(request.method==="GET"&&(url.pathname==="/lb102-source-ingress"||url.pathname==="/lb102-source-ingress/")){sendHtml(response,LB102_SOURCE_INGRESS_UI);return;}
   if(request.method==="PUT"&&url.pathname==="/api/lb102/source-assets/package"){const actor=security.authenticate(request);security.require(actor,"ADMIN");if(actor.namedIdentity!==true)throw new Error("El ingreso de paquete LB102 exige identidad nominativa ADMIN.");if(request.headers["content-type"]?.split(";")[0]!=="application/zip")throw new Error("El paquete debe enviarse como application/zip.");const bytes=await readBinary(request);const ingested=await persistLB102ProtectedSourcePackage(bytes);const groupStatus=await statuses();sendJson(response,200,{ingested,ready:groupStatus.filter(item=>item.group!=="ferreteria").every(item=>item.ready),groups:groupStatus,productionReady:false,humanValidationRequired:true});return;}
   sendJson(response,405,{error:"Método no permitido.",productionReady:false});
  }catch(error){sendJson(response,400,{error:error instanceof Error?error.message:String(error),productionReady:false});}
 });return server;
}
