import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { createLB102RuntimeServerWithSourceIngress } from "../lb102/LB102SourceIngressServer";
import { ADAPTIVE_FLOW_UI } from "../lb7/AdaptiveFlowUi";
import { SecurityPolicy } from "../lb7/SecurityPolicy";
import { AdaptiveCaseStore } from "../../infrastructure/operations/lb7/AdaptiveCaseStore";
import { HttpAdaptiveCaseMirror } from "../../infrastructure/operations/lb85/ExternalAdaptiveCaseMirror";
import { createHttpPersistedTemplateAssetStoreFromEnv } from "../../application/intake/lb94/HttpPersistedTemplateAssetStore";
import { generateLB103AuthoritativeSupplyPackage } from "../../application/universal/LB103AuthoritativeSupplyGeneration";
import { evaluateLB103ServerValidatedPreflight } from "../../application/universal/LB103ServerValidatedPreflight";
import { LB103_AUTHORITATIVE_GENERATION_SCRIPT } from "./LB103AuthoritativeGenerationScript";
import { runLB103NewCaseSelfTest } from "../../application/universal/LB103NewCaseSelfTest";

const MAX_SEAL_REQUEST_BYTES = 64 * 1024;
const DATA_ROOT = path.resolve(process.env.CONTRATA_IA_DATA_DIR ?? "var/contrata-ia");
const adaptiveCases = new AdaptiveCaseStore(path.join(DATA_ROOT, "adaptive-cases"));
const security = new SecurityPolicy();

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": body.length,
    "cache-control": "no-store",
  });
  response.end(body);
}

function sendText(response: ServerResponse, status: number, text: string, contentType: string): void {
  const body = Buffer.from(text);
  response.writeHead(status, {
    "content-type": contentType,
    "content-length": body.length,
    "cache-control": "no-store",
  });
  response.end(body);
}

function sendZip(response: ServerResponse, data: Uint8Array, fileName: string): void {
  const body = Buffer.from(data);
  response.setHeader("x-contrata-ia-production-ready", "false");
  response.setHeader("x-contrata-ia-human-acceptance-required", "true");
  response.writeHead(200, {
    "content-type": "application/zip",
    "content-length": body.length,
    "content-disposition": `attachment; filename="${fileName}"`,
    "cache-control": "no-store",
  });
  response.end(body);
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of request) {
    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += value.length;
    if (total > MAX_SEAL_REQUEST_BYTES) throw new Error("Solicitud de generación demasiado grande.");
    chunks.push(value);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

function routeCaseId(pathname: string, action: "lb103-preflight" | "lb103-generate"): string | null {
  const pattern = action === "lb103-preflight"
    ? /^\/api\/adaptive\/cases\/([^/]+)\/lb103-preflight$/
    : /^\/api\/adaptive\/cases\/([^/]+)\/lb103-generate$/;
  const match = pattern.exec(pathname);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]);
}

function statusFor(error: Error): number {
  if (/autenticación|credencial|sesión segura/i.test(error.message)) return 401;
  if (/permiso insuficiente/i.test(error.message)) return 403;
  if (/no encontrado/i.test(error.message)) return 404;
  if (/demasiado grande/i.test(error.message)) return 413;
  return 400;
}

function adaptiveUiWithGeneration(): string {
  const tag = '<script src="/lb103-authoritative-generation.js" defer></script>';
  return ADAPTIVE_FLOW_UI.includes("</body>") ? ADAPTIVE_FLOW_UI.replace("</body>", `${tag}</body>`) : `${ADAPTIVE_FLOW_UI}${tag}`;
}

function humanUatRoleReadiness() {
  const users = security.namedUserDirectory().filter(user => user.passwordEnabled);
  const reviewers = users.filter(user => user.role === "REVIEWER" || user.role === "ADMIN").length;
  const admins = users.filter(user => user.role === "ADMIN").length;
  return {
    passwordEnabledNamedUsers: users.length,
    reviewerCapableUsers: reviewers,
    adminCapableUsers: admins,
    twoDistinctReviewersReady: reviewers >= 2,
    finalAdminDecisionReady: admins >= 1,
    ready: reviewers >= 2 && admins >= 1,
  };
}

function runtimeVersion() {
  return {
    service: "contrata-ia",
    runtime: "LB103_AUTHORITATIVE_OVER_LB102",
    lb103Authoritative: true,
    lb102SourceIngressPreserved: true,
    commit: process.env.RENDER_GIT_COMMIT ?? process.env.GITHUB_SHA ?? "unknown",
    humanUatRoleReadiness: humanUatRoleReadiness(),
    humanAcceptanceRequired: true,
    productionReady: false,
  };
}

export function createLB103AuthoritativeServer(caseStore: AdaptiveCaseStore = adaptiveCases): http.Server {
  const baseServer = createLB102RuntimeServerWithSourceIngress();
  const baseRequest = baseServer.listeners("request")[0] as ((request: IncomingMessage, response: ServerResponse) => void) | undefined;
  if (!baseRequest) throw new Error("No se ha podido recuperar el handler HTTP canónico del runtime LB102 existente.");

  return http.createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    try {
      security.applySecurityHeaders(response);
      if (request.method === "GET" && url.pathname === "/api/lb103/new-case-selftest") {
        const store = createHttpPersistedTemplateAssetStoreFromEnv();
        if (!store) { sendJson(response, 503, {ready:false, synthetic:true, productionReady:false, blockers:["Persistencia de plantillas no configurada."]}); return; }
        const result = await runLB103NewCaseSelfTest(store);
        sendJson(response, result.ready ? 200 : 503, result);
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/runtime-version") {
        sendJson(response, 200, runtimeVersion());
        return;
      }
      if (request.method === "GET" && url.pathname === "/adaptive") {
        sendText(response, 200, adaptiveUiWithGeneration(), "text/html; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb103-authoritative-generation.js") {
        sendText(response, 200, LB103_AUTHORITATIVE_GENERATION_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }

      const preflightCaseId = request.method === "GET" ? routeCaseId(url.pathname, "lb103-preflight") : null;
      if (preflightCaseId) {
        const actor = security.authenticate(request);
        security.require(actor, "VIEWER");
        sendJson(response, 200, evaluateLB103ServerValidatedPreflight(caseStore.get(preflightCaseId)));
        return;
      }

      const generationCaseId = request.method === "POST" ? routeCaseId(url.pathname, "lb103-generate") : null;
      if (generationCaseId) {
        const actor = security.authenticate(request);
        security.require(actor, "OPERATOR");
        const body = await readJson(request);
        const snapshotSha256 = typeof body.snapshotSha256 === "string" ? body.snapshotSha256 : "";
        const documentarySelectionSha256 = typeof body.documentarySelectionSha256 === "string" ? body.documentarySelectionSha256 : "";
        const templateStore = createHttpPersistedTemplateAssetStoreFromEnv();
        if (!templateStore) {
          sendJson(response, 503, {
            error: "La generación universal exige la persistencia remota acreditada de plantillas.",
            productionReady: false,
          });
          return;
        }
        const result = await generateLB103AuthoritativeSupplyPackage({
          caseValue: caseStore.get(generationCaseId),
          presentedSeals: { snapshotSha256, documentarySelectionSha256 },
          templateStore,
        });
        if (!result.ready || !result.package?.bytes || !result.package.fileName) {
          sendJson(response, 409, {
            error: "La generación autoritativa ha sido bloqueada.",
            blockers: result.blockers,
            preflight: result.preflight,
            humanAcceptanceStillRequired: true,
            productionReady: false,
          });
          return;
        }
        sendZip(response, result.package.bytes, result.package.fileName);
        return;
      }

      baseRequest(request, response);
    } catch (error) {
      const value = error instanceof Error ? error : new Error(String(error));
      if (!response.headersSent) sendJson(response, statusFor(value), { error: value.message, productionReady: false });
      else response.end();
    }
  });
}

export async function startLB103AuthoritativeServer(
  port = Number(process.env.PORT ?? 3000),
  host = process.env.HOST ?? "0.0.0.0",
): Promise<http.Server> {
  const remote = HttpAdaptiveCaseMirror.fromEnvironment();
  if (remote) await remote.hydrate(adaptiveCases);
  const server = createLB103AuthoritativeServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });
  return server;
}
