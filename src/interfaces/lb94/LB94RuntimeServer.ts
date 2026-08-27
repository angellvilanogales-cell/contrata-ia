import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { createLB6Server } from "../lb6/LB6Server";
import { SecurityPolicy } from "../lb7/SecurityPolicy";
import { UniversalEvidenceWorkspace } from "../../application/intake/lb52/UniversalEvidenceWorkspace";
import { DurableUniversalEvidenceWorkspace } from "../../application/universal/DurableUniversalEvidenceWorkspace";
import { UniversalDurableCaseStore } from "../../application/universal/UniversalDurableCaseStore";
import { createUniversalCaseMirrorFromEnv } from "../../application/universal/HttpUniversalCaseMirror";
import { createHttpPersistedTemplateAssetStoreFromEnv } from "../../application/intake/lb94/HttpPersistedTemplateAssetStore";
import { provisionSupplyTemplateAsset } from "../../application/intake/lb94/SupplyTemplatePersistenceProvisioner";
import { generateSupplyGeneralEvidenceDocuments } from "../../application/intake/lb94/SupplyGeneralEvidenceDocumentGenerator";

const DATA_ROOT = path.resolve(process.env.CONTRATA_IA_DATA_DIR ?? "var/contrata-ia");
const EVIDENCE_ROOT = path.join(DATA_ROOT, "universal-evidence-v1");
const MAX_PROVISION_JSON_BYTES = 3 * 1024 * 1024;
const security = new SecurityPolicy();
const localEvidence = new UniversalEvidenceWorkspace(EVIDENCE_ROOT);
const durableEvidence = new DurableUniversalEvidenceWorkspace(
  EVIDENCE_ROOT,
  localEvidence,
  new UniversalDurableCaseStore(1, createUniversalCaseMirrorFromEnv() ?? undefined),
);

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": body.length, "cache-control": "no-store" });
  response.end(body);
}

function sendText(response: ServerResponse, status: number, text: string, contentType = "text/html; charset=utf-8"): void {
  const body = Buffer.from(text);
  response.writeHead(status, { "content-type": contentType, "content-length": body.length, "cache-control": "no-store" });
  response.end(body);
}

function sendBinary(response: ServerResponse, data: Uint8Array, fileName: string): void {
  const body = Buffer.from(data);
  response.writeHead(200, {
    "content-type": "application/vnd.oasis.opendocument.text",
    "content-length": body.length,
    "content-disposition": `attachment; filename="${fileName}"`,
    "cache-control": "no-store",
  });
  response.end(body);
}

function redirect(response: ServerResponse, location: string, cookie?: string): void {
  if (cookie) response.setHeader("set-cookie", cookie);
  response.writeHead(303, { location, "cache-control": "no-store" });
  response.end();
}

async function readBody(request: IncomingMessage, limit = MAX_PROVISION_JSON_BYTES): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += value.length;
    if (size > limit) throw new Error("Solicitud LB94 demasiado grande.");
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const body = await readBody(request);
  if (!body.length) return {};
  return JSON.parse(body.toString("utf8")) as Record<string, unknown>;
}

async function readForm(request: IncomingMessage): Promise<URLSearchParams> {
  return new URLSearchParams((await readBody(request, 16 * 1024)).toString("utf8"));
}

function statusFor(error: Error): number {
  if (/autenticación|credencial|sesión segura/i.test(error.message)) return 401;
  if (/permiso insuficiente/i.test(error.message)) return 403;
  if (/no encontrad|no está disponible/i.test(error.message)) return 404;
  if (/demasiado grande|tamaño/i.test(error.message)) return 413;
  return 400;
}

const ASSET_UI = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contrata-IA · Activos LB94</title>
<style>body{font-family:Arial,sans-serif;max-width:920px;margin:32px auto;padding:0 20px;color:#222}fieldset{margin:18px 0;padding:18px}button{padding:9px 14px}pre{white-space:pre-wrap;background:#f4f4f4;padding:14px}.ok{color:#176b35}.bad{color:#a62121}</style></head>
<body><h1>Contrata-IA · Activos físicos LB94</h1>
<p>Esta pantalla instala únicamente los binarios exactos acreditados. El servidor valida SHA-256 antes de persistirlos; la credencial de Supabase nunca llega al navegador.</p>
<div id="auth"><form method="post" action="/lb94/login"><label>Credencial administrativa <input name="token" type="password" autocomplete="current-password"></label> <button>Iniciar sesión</button></form></div>
<fieldset><legend>PCAP oficial Supply ASA</legend><input type="file" id="pcap" accept=".odt"><button data-id="JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17" data-file="pcap">Instalar PCAP</button></fieldset>
<fieldset><legend>Memoria Supply general derivada</legend><input type="file" id="memory" accept=".odt"><button data-id="contrata-ia:supply:memory:general:LB94-SUPPLY-GENERAL-ODT-V2" data-file="memory">Instalar Memoria</button></fieldset>
<fieldset><legend>PPT Supply general derivado</legend><input type="file" id="ppt" accept=".odt"><button data-id="contrata-ia:supply:ppt:general:LB94-SUPPLY-GENERAL-ODT-V2" data-file="ppt">Instalar PPT</button></fieldset>
<button id="check">Comprobar readiness</button><pre id="out">Pendiente.</pre>
<script>
const out=document.getElementById('out');
async function fileBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(r.error);r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.readAsDataURL(file);});}
async function provision(button){const input=document.getElementById(button.dataset.file);const file=input.files&&input.files[0];if(!file){out.textContent='Selecciona primero el ODT correspondiente.';return;}out.textContent='Validando e instalando '+file.name+'…';const contentBase64=await fileBase64(file);const response=await fetch('/api/lb94/templates/provision',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({templateId:button.dataset.id,contentBase64})});const data=await response.json();out.textContent=JSON.stringify(data,null,2);out.className=response.ok?'ok':'bad';}
document.querySelectorAll('button[data-id]').forEach(button=>button.addEventListener('click',()=>provision(button).catch(e=>{out.textContent=String(e);out.className='bad';})));
document.getElementById('check').addEventListener('click',async()=>{const r=await fetch('/api/lb94/templates/readiness');const d=await r.json();out.textContent=JSON.stringify(d,null,2);out.className=r.ok&&d.ready?'ok':'bad';});
</script></body></html>`;

/**
 * Capa LB94 deliberadamente pequeña. Intercepta solo las rutas nuevas y delega
 * toda la aplicación existente al servidor LB6, evitando duplicar o alterar su
 * enrutamiento. Las acciones sensibles reutilizan SecurityPolicy y la sesión
 * segura ya existente.
 */
export function createLB94RuntimeServer(): http.Server {
  const base = createLB6Server();
  return http.createServer(async (request, response) => {
    security.applySecurityHeaders(response);
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      const parts = url.pathname.split("/").filter(Boolean);

      if (request.method === "GET" && url.pathname === "/lb94-assets") {
        sendText(response, 200, ASSET_UI);
        return;
      }

      if (request.method === "POST" && url.pathname === "/lb94/login") {
        const form = await readForm(request);
        const token = String(form.get("token") ?? "").trim();
        if (!token) throw new Error("Falta la credencial de acceso.");
        security.authenticateToken(token);
        redirect(response, "/lb94-assets", security.sessionCookie(token));
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/lb94/templates/readiness") {
        const actor = security.authenticate(request); security.require(actor, "VIEWER");
        const store = createHttpPersistedTemplateAssetStoreFromEnv();
        if (!store) { sendJson(response, 503, { ready: false, blockers: ["Persistencia externa LB94 no configurada."] }); return; }
        sendJson(response, 200, await store.readiness());
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/lb94/templates/provision") {
        const actor = security.authenticate(request); security.require(actor, "ADMIN");
        const body = await readJson(request);
        const templateId = typeof body.templateId === "string" ? body.templateId : "";
        const contentBase64 = typeof body.contentBase64 === "string" ? body.contentBase64 : "";
        const result = await provisionSupplyTemplateAsset({ templateId, contentBase64 });
        sendJson(response, 200, result);
        return;
      }

      if (parts[0] === "api" && parts[1] === "lb94" && parts[2] === "cases" && parts[3]) {
        const caseId = decodeURIComponent(parts[3]);
        if (request.method === "GET" && parts[4] === "readiness" && parts.length === 5) {
          const actor = security.authenticate(request); security.require(actor, "VIEWER");
          const restored = await durableEvidence.get(caseId);
          const evidence = localEvidence.readiness(caseId);
          const store = createHttpPersistedTemplateAssetStoreFromEnv();
          const templates = store ? await store.readiness() : { ready: false, blockers: ["Persistencia externa LB94 no configurada."], assets: [] };
          sendJson(response, 200, { ready: evidence.ready && templates.ready, evidence, templates, persistence: restored.persistence.status, humanValidationRequired: true });
          return;
        }

        if (request.method === "POST" && parts[4] === "generate" && parts[5] && parts.length === 6) {
          const actor = security.authenticate(request); security.require(actor, "OPERATOR");
          const kind = String(parts[5]).toUpperCase();
          if (kind !== "MEMORIA" && kind !== "PPT") throw new Error("Documento LB94 no admitido.");
          const restored = await durableEvidence.get(caseId);
          const evidenceReadiness = localEvidence.readiness(caseId);
          if (!evidenceReadiness.ready) { sendJson(response, 409, { ready: false, blockers: evidenceReadiness.blockers }); return; }
          const store = createHttpPersistedTemplateAssetStoreFromEnv();
          if (!store) { sendJson(response, 503, { ready: false, blockers: ["Persistencia externa LB94 no configurada."] }); return; }
          const generated = await generateSupplyGeneralEvidenceDocuments({ record: restored.record, templateStore: store });
          if (!generated.ready) { sendJson(response, 409, generated); return; }
          const document = generated.documents.find(item => item.kind === (kind === "MEMORIA" ? "MEMORY" : "PPT"));
          if (!document) throw new Error(`No se generó ${kind}.`);
          sendBinary(response, document.bytes, document.fileName);
          return;
        }
      }

      base.emit("request", request, response);
    } catch (error) {
      const failure = error instanceof Error ? error : new Error(String(error));
      if (!response.headersSent) sendJson(response, statusFor(failure), { error: failure.message });
      else response.end();
    }
  });
}
