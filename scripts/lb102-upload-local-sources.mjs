import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const base=(process.env.CONTRATA_IA_PUBLIC_BASE_URL??process.env.RENDER_EXTERNAL_URL??"").trim().replace(/\/+$/,"");
const token=(process.env.CONTRATA_IA_ADMIN_TOKEN??process.env.CONTRATA_IA_LB102_ADMIN_TOKEN??"").trim();
const dir=path.resolve(process.argv[2]??process.env.CONTRATA_IA_SOURCE_DIR??".");
if(!base.startsWith("https://"))throw new Error("Falta CONTRATA_IA_PUBLIC_BASE_URL/RENDER_EXTERNAL_URL HTTPS.");
if(token.length<16)throw new Error("Falta CONTRATA_IA_ADMIN_TOKEN nominativo o CONTRATA_IA_LB102_ADMIN_TOKEN.");

const files=[
 {group:"panda",kind:"MEMORIA",names:["panda_memoria_v8.odt"]},
 {group:"panda",kind:"PCAP",names:["panda_pcap_v8.odt"]},
 {group:"panda",kind:"PPT",names:["panda_ppt_v8.odt"]},
 {group:"service-huelva",kind:"MEMORIA",names:["huelva_memoria_v8.odt"]},
 {group:"service-huelva",kind:"PCAP",names:["huelva_pcap_v8.odt"]},
 {group:"service-huelva",kind:"PPT",names:["huelva_ppt_v8.odt"]},
 {group:"service-sevilla",kind:"MEMORIA",names:["sevilla_memoria_v8.odt"]},
 {group:"service-sevilla",kind:"PCAP",names:["sevilla_pcap_v8.odt"]},
 {group:"service-sevilla",kind:"PPT",names:["sevilla_ppt_v8.odt"]},
 {group:"ferreteria",kind:"MEMORIA",optional:true,names:["04_Memoría Ferretería SSCC SAE V12_letrado.odt","04_Memoría Ferretería SSCC SAE V12_letrado(1).odt"]},
 {group:"ferreteria",kind:"PPT",optional:true,names:["PPT Feretería SSCC SAE V6.odt","PPT Feretería SSCC SAE V6(2).odt"]},
];
function find(item){for(const name of item.names){const p=path.join(dir,name);if(fs.existsSync(p))return p;}return null;}
async function api(url,init={}){const r=await fetch(url,{...init,headers:{authorization:`Bearer ${token}`,...(init.headers??{})}});const text=await r.text();let body;try{body=JSON.parse(text);}catch{body={raw:text};}if(!r.ok)throw new Error(`${r.status} ${url}: ${JSON.stringify(body)}`);return body;}
const uploaded=[];
for(const item of files){const p=find(item);if(!p){if(item.optional)continue;throw new Error(`Falta ${item.group}/${item.kind} en ${dir}: ${item.names.join(" | ")}`);}const bytes=fs.readFileSync(p);const localSha=crypto.createHash("sha256").update(bytes).digest("hex");const url=`${base}/api/lb102/source-assets/${encodeURIComponent(item.group)}/${item.kind.toLowerCase()}`;const saved=await api(url,{method:"PUT",headers:{"content-type":"application/vnd.oasis.opendocument.text","content-length":String(bytes.length)},body:bytes});if(saved.sha256!==localSha||saved.byteLength!==bytes.length)throw new Error(`${item.group}/${item.kind}: respuesta remota no coincide con bytes locales.`);uploaded.push({group:item.group,kind:item.kind,file:path.basename(p),byteLength:bytes.length,sha256:localSha});console.log(`OK ${item.group}/${item.kind} ${bytes.length} B ${localSha}`);}
const status=await api(`${base}/api/lb102/source-assets`);
console.log(JSON.stringify({uploaded,status},null,2));
if(!status.groups?.filter(x=>["panda","service-huelva","service-sevilla"].includes(x.group)).every(x=>x.ready))process.exitCode=2;
