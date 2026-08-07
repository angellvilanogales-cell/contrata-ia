import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { LB6_QUESTIONS } from "../../application/intake/lb6/IntakeEngine";
import { LB6Orchestrator } from "../../application/intake/lb6/LB6Orchestrator";
import type { IntakeMode, IntakeQuestionId } from "../../application/intake/lb6/IntakeModel";
import { FileCaseRepository } from "../../infrastructure/operations/lb7/FileCaseRepository";
import { HashChainAuditLog } from "../../infrastructure/operations/lb7/HashChainAuditLog";
import { SecurityPolicy, type ApplicationRole } from "../lb7/SecurityPolicy";

const MAX_JSON_BYTES = 12 * 1024 * 1024;

function buildOperationalOrchestrator(): LB6Orchestrator {
  const root = path.resolve(process.env.CONTRATA_IA_DATA_DIR ?? "var/contrata-ia");
  return new LB6Orchestrator({
    repository: new FileCaseRepository(path.join(root, "cases")),
    audit: new HashChainAuditLog(path.join(root, "audit", "security.jsonl"))
  });
}

const orchestrator = buildOperationalOrchestrator();
const security = new SecurityPolicy();

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": body.length });
  response.end(body);
}
function sendBinary(response: ServerResponse, status: number, data: Uint8Array, contentType: string, fileName: string): void {
  const body = Buffer.from(data);
  response.writeHead(status, { "content-type": contentType, "content-length": body.length, "content-disposition": `attachment; filename="${fileName}"` });
  response.end(body);
}
async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += value.length;
    if (size > MAX_JSON_BYTES) throw new Error("Solicitud demasiado grande.");
    chunks.push(value);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}
function routeParts(pathname: string): string[] { return pathname.split("/").filter(Boolean); }
function statusForError(error: Error): number {
  if (/autenticación|credencial/i.test(error.message)) return 401;
  if (/permiso insuficiente/i.test(error.message)) return 403;
  if (/no encontrado/i.test(error.message)) return 404;
  if (/demasiado grande/i.test(error.message)) return 413;
  return 400;
}

const UI = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contrata-IA · Expediente</title><style>body{font-family:Arial,sans-serif;margin:0;background:#f4f6f7;color:#17202a}header{background:#fff;border-bottom:1px solid #ddd;padding:18px 28px}main{max-width:1080px;margin:24px auto;padding:0 18px}.card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:20px;margin-bottom:16px}button{padding:10px 14px;margin:4px;border:0;border-radius:5px;background:#176b45;color:#fff;cursor:pointer}button.secondary{background:#566573}input,textarea,select{box-sizing:border-box;width:100%;padding:9px;margin:5px 0 12px;border:1px solid #bbb;border-radius:4px}textarea{min-height:90px}.muted{color:#626567}.warning{background:#fff3cd;padding:10px;border-radius:5px}.ok{background:#e8f5e9;padding:10px;border-radius:5px}pre{white-space:pre-wrap;background:#f8f9f9;padding:12px}.files{display:flex;flex-wrap:wrap;gap:6px}</style></head><body><header><strong>Contrata-IA</strong> · Preparación del expediente</header><main><div class="card"><h2>Acceso</h2><label>Credencial de acceso (si el entorno la requiere)</label><input id="tokenInput" type="password" autocomplete="off" placeholder="Bearer token"><button class="secondary" onclick="setToken()">Aplicar credencial</button><span id="tokenStatus" class="muted"></span></div><div class="card"><h2>Cómo desea empezar</h2><button onclick="createCase('GUIDED')">Asistente guiado</button><button onclick="downloadBlank()">Descargar Ficha de Datos</button><p class="muted">También puede importar una ficha cumplimentada y continuar después en modo híbrido.</p><input id="file" type="file" accept=".docx"><button class="secondary" onclick="importFile()">Importar ficha</button></div><div id="work"></div></main><script>
let caseId=null;let token='';let generatedFiles=[];
function setToken(){token=document.getElementById('tokenInput').value.trim();document.getElementById('tokenStatus').textContent=token?' Credencial aplicada para esta sesión del navegador.':' Sin credencial.';}
function headers(json=true){const h={};if(json)h['content-type']='application/json';if(token)h.authorization='Bearer '+token;return h;}
async function api(url,opt={}){opt.headers={...(opt.headers||{}),...(token?{authorization:'Bearer '+token}:{})};const r=await fetch(url,opt);if(!r.ok){let e;try{e=await r.json()}catch{e={error:await r.text()}}throw new Error(e.error||'Error');}return r;}
async function download(url){try{const r=await api(url,{headers:headers(false)});const blob=await r.blob();const disposition=r.headers.get('content-disposition')||'';const match=/filename="([^"]+)"/.exec(disposition);const name=match?match[1]:'documento.docx';const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}catch(e){alert(e.message);}}
async function createCase(mode){try{const r=await api('/api/cases',{method:'POST',headers:headers(),body:JSON.stringify({mode})});const c=await r.json();caseId=c.id;await refresh();}catch(e){alert(e.message);}}
function downloadBlank(){return download('/api/questionnaire');}
async function importFile(){try{const f=document.getElementById('file').files[0];if(!f)return alert('Seleccione una ficha DOCX');const b=new Uint8Array(await f.arrayBuffer());let s='';for(const x of b)s+=String.fromCharCode(x);const r=await api('/api/questionnaire/import',{method:'POST',headers:headers(),body:JSON.stringify({caseId,base64:btoa(s)})});const out=await r.json();caseId=out.caseValue.id;await refresh();}catch(e){alert(e.message);}}
function field(q){if(q.answerType==='BOOLEAN')return '<select id="ans"><option value="">Seleccione</option><option>Sí</option><option>No</option></select>';if(q.choices)return '<select id="ans"><option value="">Seleccione</option>'+q.choices.map(x=>'<option>'+x+'</option>').join('')+'</select>';if(q.answerType==='LIST')return '<textarea id="ans" placeholder="Un elemento por línea"></textarea>';return '<textarea id="ans"></textarea>';}
async function refresh(){try{if(!caseId)return;const r=await api('/api/cases/'+encodeURIComponent(caseId));const c=await r.json();const p=c.progress;let html='<div class="card"><h2>Expediente '+caseId+'</h2><p>Modo: '+c.caseValue.mode+' · respuestas: '+p.answeredQuestions+'/'+p.totalQuestions+'</p><button class="secondary" onclick="downloadCurrent()">Descargar ficha parcialmente cumplimentada</button></div>';if(p.nextQuestion){const q=p.nextQuestion;html+='<div class="card"><h3>'+q.label+'</h3><p>'+q.help+'</p><p class="muted">'+q.requirement+'</p>'+field(q)+'<button onclick="answer(\''+q.id+'\')">Guardar y continuar</button></div>';}else html+='<div class="card"><h3>Datos obligatorios completos</h3><button onclick="review()">Revisar propuestas y validar</button></div>';if(p.warnings.length)html+='<div class="card warning">'+p.warnings.join('<br>')+'</div>';document.getElementById('work').innerHTML=html;}catch(e){alert(e.message);}}
async function answer(id){try{await api('/api/cases/'+encodeURIComponent(caseId)+'/answers',{method:'POST',headers:headers(),body:JSON.stringify({questionId:id,value:document.getElementById('ans').value})});await refresh();}catch(e){alert(e.message);}}
function downloadCurrent(){return download('/api/cases/'+encodeURIComponent(caseId)+'/questionnaire');}
async function review(){try{const r=await api('/api/cases/'+encodeURIComponent(caseId)+'/review');const v=await r.json();document.getElementById('work').innerHTML='<div class="card"><h2>Revisión previa</h2><pre>'+JSON.stringify(v,null,2).replaceAll('<','&lt;')+'</pre><label>Persona que valida</label><input id="validator"><button onclick="validateCase()">Validar decisiones y habilitar generación</button></div>';}catch(e){alert(e.message);}}
function saveGenerated(index){const f=generatedFiles[index];const raw=atob(f.base64);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const blob=new Blob([bytes],{type:f.mimeType});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=f.fileName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function validateCase(){try{const validatedBy=document.getElementById('validator').value;await api('/api/cases/'+encodeURIComponent(caseId)+'/validate',{method:'POST',headers:headers(),body:JSON.stringify({validatedBy})});const r=await api('/api/cases/'+encodeURIComponent(caseId)+'/generate',{method:'POST',headers:headers(false)});const out=await r.json();generatedFiles=out.documents;const buttons=generatedFiles.map((f,i)=>'<button class="secondary" onclick="saveGenerated('+i+')">'+f.fileName+'</button>').join('');document.getElementById('work').innerHTML='<div class="card ok"><h2>Expediente generado</h2><p>'+out.documents.length+' archivos disponibles para descarga.</p><div class="files">'+buttons+'</div></div><div class="card"><h3>Manifiesto</h3><pre>'+JSON.stringify(out.manifest,null,2)+'</pre></div>';}catch(e){alert(e.message);}}
</script></body></html>`;

function requireRole(request: IncomingMessage, minimum: ApplicationRole) {
  const actor = security.authenticate(request);
  security.require(actor, minimum);
  return actor;
}

export function createLB6Server(): http.Server {
  return http.createServer(async (request, response) => {
    security.applySecurityHeaders(response);
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      const parts = routeParts(url.pathname);
      if (request.method === "GET" && url.pathname === "/") { response.writeHead(200, { "content-type": "text/html; charset=utf-8" }); response.end(UI); return; }
      if (request.method === "GET" && url.pathname === "/api/health") { sendJson(response, 200, { status: "ok", service: "contrata-ia", lb: 7, timestamp: new Date().toISOString() }); return; }
      if (request.method === "GET" && url.pathname === "/api/questions") { requireRole(request, "VIEWER"); sendJson(response, 200, LB6_QUESTIONS); return; }
      if (request.method === "GET" && url.pathname === "/api/questionnaire") { requireRole(request, "OPERATOR"); const file = orchestrator.questionnaire(); sendBinary(response, 200, file.data, file.mimeType, file.fileName); return; }
      if (request.method === "POST" && url.pathname === "/api/questionnaire/import") { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const base64 = String(body.base64 ?? ""); if (!base64) throw new Error("Falta el contenido base64 de la ficha."); const result = orchestrator.importQuestionnaire(Buffer.from(base64, "base64"), body.caseId ? String(body.caseId) : undefined, actor.id); sendJson(response, 200, result); return; }
      if (request.method === "POST" && url.pathname === "/api/cases") { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const mode = (body.mode ?? "GUIDED") as IntakeMode; const created = orchestrator.createCase(mode, undefined, actor.id); sendJson(response, 201, created); return; }
      if (request.method === "POST" && url.pathname === "/api/admin/backup") { const actor = requireRole(request, "ADMIN"); sendJson(response, 200, { location: orchestrator.backup(actor.id) }); return; }
      if (parts[0] === "api" && parts[1] === "cases" && parts[2]) {
        const id = decodeURIComponent(parts[2]);
        if (request.method === "GET" && parts.length === 3) { requireRole(request, "VIEWER"); sendJson(response, 200, { caseValue: orchestrator.getCase(id), progress: orchestrator.progress(id) }); return; }
        if (request.method === "POST" && parts[3] === "answers") { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const updated = orchestrator.answer(id, String(body.questionId) as IntakeQuestionId, body.value, actor.id); sendJson(response, 200, { caseValue: updated, progress: orchestrator.progress(id) }); return; }
        if (request.method === "GET" && parts[3] === "questionnaire") { requireRole(request, "OPERATOR"); const file = orchestrator.questionnaire(id); sendBinary(response, 200, file.data, file.mimeType, file.fileName); return; }
        if (request.method === "GET" && parts[3] === "review") { requireRole(request, "VIEWER"); sendJson(response, 200, orchestrator.review(id)); return; }
        if (request.method === "POST" && parts[3] === "validate") { const actor = requireRole(request, "REVIEWER"); const body = await readJson(request); const validatedBy = String(body.validatedBy ?? actor.id).trim() || actor.id; sendJson(response, 200, orchestrator.validate(id, validatedBy)); return; }
        if (request.method === "POST" && parts[3] === "generate") {
          const actor = requireRole(request, "OPERATOR");
          const rendered = orchestrator.generate(id, actor.id);
          sendJson(response, 200, {
            manifest: { expedienteId: id, validation: rendered.package.globalValidation, coherenceFingerprint: rendered.package.coherenceFingerprint },
            documents: [...rendered.editable, ...rendered.pdf].map(file => ({ documentId: file.documentId, fileName: file.fileName, mimeType: file.mimeType, base64: Buffer.from(file.data).toString("base64") }))
          });
          return;
        }
      }
      sendJson(response, 404, { error: "Ruta no encontrada." });
    } catch (error) {
      const value = error instanceof Error ? error : new Error(String(error));
      sendJson(response, statusForError(value), { error: value.message });
    }
  });
}

export async function startLB6Server(port = Number(process.env.PORT ?? 3000)): Promise<http.Server> {
  const server = createLB6Server();
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", () => resolve()); });
  return server;
}
