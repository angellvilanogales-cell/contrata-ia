import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { LB6_QUESTIONS } from "../../application/intake/lb6/IntakeEngine";
import { LB6Orchestrator } from "../../application/intake/lb6/LB6Orchestrator";
import type { IntakeMode, IntakeQuestionId } from "../../application/intake/lb6/IntakeModel";
import { AdaptiveProcurementFlow, type AdaptiveFlowAnswers } from "../../application/intake/lb7/AdaptiveProcurementFlow";
import type { EventAnswerId, EventFeature } from "../../application/intake/lb7/EventServicesProfile";
import { UniversalOfficialTemplateRegistry } from "../../application/intake/lb19/UniversalOfficialTemplateRegistry";
import { evaluateUniversalApplicationIntegration } from "../../application/intake/lb21/UniversalApplicationIntegration";
import { bridgeLegacyIntakeCaseToUniversal } from "../../application/intake/lb21/UniversalLegacyCaseBridge";
import { evaluateSupplyAsaProtectedPipelineReadiness } from "../../application/intake/lb29/UniversalSupplyAsaProtectedPipeline";
import { PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX, evaluateProcurementSourceCaseCoverage } from "../../application/intake/lb50/ProcurementSourceCaseCoverageMatrix";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST, evaluateUniversalV1UiFieldManifest } from "../../application/intake/lb51/UniversalV1UiFieldManifest";
import { UniversalEvidenceCaseService } from "../../application/intake/lb53/UniversalEvidenceCaseService";
import type { UniversalUiDraftMutation } from "../../application/intake/lb53/UniversalUiEvidenceDraft";
import type { PreLegalReviewInput } from "../../application/legal-review/lb7/PreLegalReview";
import { AdaptiveCaseStore } from "../../infrastructure/operations/lb7/AdaptiveCaseStore";
import { FileCaseRepository } from "../../infrastructure/operations/lb7/FileCaseRepository";
import { HashChainAuditLog } from "../../infrastructure/operations/lb7/HashChainAuditLog";
import { FERRETERIA_V1_EDITABLE_ASSET_MANIFEST, evaluateFerreteriaV1RuntimeAssetReadiness } from "../../infrastructure/operations/lb52/VerifiedEditableAssetStore";
import { ADAPTIVE_FLOW_SCRIPT } from "../lb7/AdaptiveFlowScript";
import { ADAPTIVE_FLOW_UI } from "../lb7/AdaptiveFlowUi";
import { ADAPTIVE_PERSISTENCE_SCRIPT } from "../lb7/AdaptivePersistenceScript";
import { MAIN_PILOT_UI } from "../lb7/MainPilotUi";
import { PWA_ICON_SVG, PWA_MANIFEST, PWA_SERVICE_WORKER } from "../lb7/PwaAssets";
import { SecurityPolicy, type ApplicationRole } from "../lb7/SecurityPolicy";
import { SPECIALIZED_WORKFLOW_UI } from "../lb7/SpecializedWorkflowUi";
import { SUPPLY_CATALOGUE_SCRIPT } from "../lb7/SupplyCatalogueScript";
import { SUPPLY_ECONOMIC_PERIOD_SCRIPT } from "../lb7/SupplyEconomicPeriodScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../lb7/SupplyFinalizationScript";
import { SUPPLY_QUALIFICATION_SCRIPT } from "../lb7/SupplyQualificationScript";

const MAX_JSON_BYTES = 12 * 1024 * 1024;
const DATA_ROOT = path.resolve(process.env.CONTRATA_IA_DATA_DIR ?? "var/contrata-ia");
function buildOperationalOrchestrator(): LB6Orchestrator { return new LB6Orchestrator({ repository: new FileCaseRepository(path.join(DATA_ROOT, "cases")), audit: new HashChainAuditLog(path.join(DATA_ROOT, "audit", "security.jsonl")) }); }
const orchestrator = buildOperationalOrchestrator();
const security = new SecurityPolicy();
const adaptiveFlow = new AdaptiveProcurementFlow();
const adaptiveCases = new AdaptiveCaseStore(path.join(DATA_ROOT, "adaptive-cases"));
const universalEvidenceCases = new UniversalEvidenceCaseService(adaptiveCases);
const universalTemplateRegistry = new UniversalOfficialTemplateRegistry();
function sendJson(response: ServerResponse, status: number, value: unknown): void { const body = Buffer.from(JSON.stringify(value)); response.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": body.length }); response.end(body); }
function sendText(response: ServerResponse, status: number, bodyText: string, contentType: string, cacheControl = "no-cache"): void { const body = Buffer.from(bodyText); response.writeHead(status, { "content-type": contentType, "content-length": body.length, "cache-control": cacheControl }); response.end(body); }
function redirect(response: ServerResponse, location: string, cookie?: string): void { if (cookie) response.setHeader("set-cookie", cookie); response.writeHead(303, { location, "cache-control": "no-store" }); response.end(); }
function sendBinary(response: ServerResponse, status: number, data: Uint8Array, contentType: string, fileName: string): void { const body = Buffer.from(data); response.writeHead(status, { "content-type": contentType, "content-length": body.length, "content-disposition": `attachment; filename="${fileName}"` }); response.end(body); }
async function readBody(request: IncomingMessage): Promise<Buffer> { const chunks: Buffer[] = []; let size = 0; for await (const chunk of request) { const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); size += value.length; if (size > MAX_JSON_BYTES) throw new Error("Solicitud demasiado grande."); chunks.push(value); } return Buffer.concat(chunks); }
async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> { const body = await readBody(request); if (body.length === 0) return {}; return JSON.parse(body.toString("utf8")) as Record<string, unknown>; }
async function readForm(request: IncomingMessage): Promise<URLSearchParams> { const body = await readBody(request); return new URLSearchParams(body.toString("utf8")); }
function routeParts(pathname: string): string[] { return pathname.split("/").filter(Boolean); }
function statusForError(error: Error): number { if (/autenticación|credencial|sesión segura/i.test(error.message)) return 401; if (/permiso insuficiente/i.test(error.message)) return 403; if (/no encontrado/i.test(error.message)) return 404; if (/demasiado grande/i.test(error.message)) return 413; return 400; }
function requireRole(request: IncomingMessage, minimum: ApplicationRole) { const actor = security.authenticate(request); security.require(actor, minimum); return actor; }
function eventFeatures(value: unknown): readonly EventFeature[] { if (!Array.isArray(value)) return []; return value.map(String) as EventFeature[]; }
function eventAnswers(value: unknown): Readonly<Partial<Record<EventAnswerId, unknown>>> { if (!value || typeof value !== "object" || Array.isArray(value)) return {}; return value as Readonly<Partial<Record<EventAnswerId, unknown>>>; }
function adaptiveAnswers(value: unknown): AdaptiveFlowAnswers { if (!value || typeof value !== "object" || Array.isArray(value)) return {}; return value as AdaptiveFlowAnswers; }

export function createLB6Server(): http.Server {
  return http.createServer(async (request, response) => {
    security.applySecurityHeaders(response);
    try {
      const url = new URL(request.url ?? "/", "http://localhost"); const parts = routeParts(url.pathname);
      if (request.method === "GET" && url.pathname === "/") { sendText(response, 200, MAIN_PILOT_UI, "text/html; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/adaptive") { sendText(response, 200, ADAPTIVE_FLOW_UI, "text/html; charset=utf-8", "no-store"); return; }
      if (request.method === "GET" && url.pathname === "/adaptive.js") { sendText(response, 200, ADAPTIVE_FLOW_SCRIPT, "application/javascript; charset=utf-8", "no-store"); return; }
      if (request.method === "GET" && url.pathname === "/adaptive-persistence.js") { sendText(response, 200, ADAPTIVE_PERSISTENCE_SCRIPT, "application/javascript; charset=utf-8", "no-store"); return; }
      if (request.method === "GET" && url.pathname === "/supply-catalogue.js") { sendText(response, 200, SUPPLY_CATALOGUE_SCRIPT, "application/javascript; charset=utf-8", "no-store"); return; }
      if (request.method === "GET" && url.pathname === "/supply-economic-period.js") { sendText(response, 200, SUPPLY_ECONOMIC_PERIOD_SCRIPT, "application/javascript; charset=utf-8", "no-store"); return; }
      if (request.method === "GET" && url.pathname === "/supply-qualification.js") { sendText(response, 200, SUPPLY_QUALIFICATION_SCRIPT, "application/javascript; charset=utf-8", "no-store"); return; }
      if (request.method === "GET" && url.pathname === "/supply-finalization.js") { sendText(response, 200, SUPPLY_FINALIZATION_SCRIPT, "application/javascript; charset=utf-8", "no-store"); return; }
      if (request.method === "POST" && url.pathname === "/adaptive/login") { const form = await readForm(request); const token = String(form.get("token") ?? "").trim(); if (!token) throw new Error("Falta la credencial de acceso."); security.authenticateToken(token); redirect(response, "/adaptive", security.sessionCookie(token)); return; }
      if (request.method === "POST" && url.pathname === "/adaptive/logout") { redirect(response, "/adaptive", security.clearSessionCookie()); return; }
      if (request.method === "GET" && url.pathname === "/specialized") { sendText(response, 200, SPECIALIZED_WORKFLOW_UI, "text/html; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/manifest.webmanifest") { sendText(response, 200, PWA_MANIFEST, "application/manifest+json; charset=utf-8", "public, max-age=3600"); return; }
      if (request.method === "GET" && url.pathname === "/sw.js") { sendText(response, 200, PWA_SERVICE_WORKER, "application/javascript; charset=utf-8", "no-cache"); return; }
      if (request.method === "GET" && url.pathname === "/icons/contrata-ia.svg") { sendText(response, 200, PWA_ICON_SVG, "image/svg+xml; charset=utf-8", "public, max-age=86400"); return; }
      if (request.method === "GET" && url.pathname === "/api/health") { sendJson(response, 200, { status: "ok", service: "contrata-ia", lb: 53, pwa: true, specializedWorkflow: true, adaptiveFlow: true, adaptivePersistence: true, universalReadiness: true, protectedSupplyAsaPipeline: true, sourceCoverageMatrix: true, universalUiManifest: true, universalEvidencePersistence: true, verifiedEditableAssetStore: true, timestamp: new Date().toISOString() }); return; }
      if (request.method === "GET" && url.pathname === "/api/source-coverage") { requireRole(request, "VIEWER"); sendJson(response, 200, { matrix: PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX, evaluation: evaluateProcurementSourceCaseCoverage() }); return; }
      if (request.method === "GET" && url.pathname === "/api/universal-ui-manifest") { requireRole(request, "VIEWER"); sendJson(response, 200, { fields: UNIVERSAL_V1_UI_FIELD_MANIFEST, evaluation: evaluateUniversalV1UiFieldManifest() }); return; }
      if (request.method === "GET" && url.pathname === "/api/runtime-assets/readiness") { requireRole(request, "VIEWER"); sendJson(response, 200, { assets: FERRETERIA_V1_EDITABLE_ASSET_MANIFEST.map(asset => ({ assetId: asset.assetId, fileName: asset.fileName, role: asset.role, identityConfigured: Boolean(asset.expectedSha256) })), evaluation: evaluateFerreteriaV1RuntimeAssetReadiness() }); return; }
      if (request.method === "POST" && url.pathname === "/api/adaptive/cases") { requireRole(request, "OPERATOR"); sendJson(response, 201, adaptiveCases.create()); return; }
      if (parts[0] === "api" && parts[1] === "adaptive" && parts[2] === "cases" && parts[3]) {
        const caseId = decodeURIComponent(parts[3]);
        if (request.method === "GET" && parts.length === 4) { requireRole(request, "VIEWER"); sendJson(response, 200, adaptiveCases.get(caseId)); return; }
        if (request.method === "PUT" && parts.length === 4) { requireRole(request, "OPERATOR"); const body = await readJson(request); sendJson(response, 200, adaptiveCases.save(caseId, adaptiveAnswers(body.answers), body.supplyCatalogue)); return; }
        if (request.method === "GET" && parts[4] === "universal-evidence" && parts.length === 5) { requireRole(request, "VIEWER"); sendJson(response, 200, { caseId, evidence: universalEvidenceCases.list(caseId) }); return; }
        if (request.method === "PUT" && parts[4] === "universal-evidence" && parts.length === 5) { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const mutation: UniversalUiDraftMutation = { fieldPath: String(body.fieldPath ?? ""), value: body.value, ...(body.sourceId ? { sourceId: String(body.sourceId) } : {}), ...(body.note ? { note: String(body.note) } : {}) }; sendJson(response, 200, universalEvidenceCases.declare(caseId, mutation, actor.id)); return; }
        if (request.method === "POST" && parts[4] === "universal-evidence" && parts[5] === "validate" && parts.length === 6) { const actor = requireRole(request, "REVIEWER"); const body = await readJson(request); sendJson(response, 200, universalEvidenceCases.validate(caseId, String(body.fieldPath ?? ""), actor.id)); return; }
      }
      if (request.method === "POST" && url.pathname === "/api/adaptive/analyze") { requireRole(request, "OPERATOR"); const body = await readJson(request); sendJson(response, 200, adaptiveFlow.analyze(adaptiveAnswers(body.answers))); return; }
      if (request.method === "GET" && url.pathname === "/api/questions") { requireRole(request, "VIEWER"); sendJson(response, 200, LB6_QUESTIONS); return; }
      if (request.method === "GET" && url.pathname === "/api/questionnaire") { requireRole(request, "OPERATOR"); const file = orchestrator.questionnaire(); sendBinary(response, 200, file.data, file.mimeType, file.fileName); return; }
      if (request.method === "POST" && url.pathname === "/api/questionnaire/import") { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const base64 = String(body.base64 ?? ""); if (!base64) throw new Error("Falta el contenido base64 de la ficha."); const result = orchestrator.importQuestionnaire(Buffer.from(base64, "base64"), body.caseId ? String(body.caseId) : undefined, actor.id); sendJson(response, 200, result); return; }
      if (request.method === "POST" && url.pathname === "/api/cases") { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const mode = (body.mode ?? "GUIDED") as IntakeMode; sendJson(response, 201, orchestrator.createCase(mode, undefined, actor.id)); return; }
      if (request.method === "POST" && url.pathname === "/api/admin/backup") { const actor = requireRole(request, "ADMIN"); sendJson(response, 200, { location: orchestrator.backup(actor.id) }); return; }
      if (parts[0] === "api" && parts[1] === "cases" && parts[2]) {
        const id = decodeURIComponent(parts[2]);
        if (request.method === "GET" && parts.length === 3) { requireRole(request, "VIEWER"); sendJson(response, 200, { caseValue: orchestrator.getCase(id), progress: orchestrator.progress(id) }); return; }
        if (request.method === "GET" && parts[3] === "universal-readiness") {
          requireRole(request, "VIEWER");
          const caseValue = orchestrator.getCase(id);
          const migration = bridgeLegacyIntakeCaseToUniversal(caseValue);
          const procurementDate = url.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
          const integration = evaluateUniversalApplicationIntegration(
            migration.expediente,
            universalTemplateRegistry,
            procurementDate,
            ["DPCAF", "PCAP", "PPT"],
          );
          const supplyAsaPcap = evaluateSupplyAsaProtectedPipelineReadiness(migration.expediente, procurementDate, false);
          sendJson(response, 200, {
            caseId: id,
            procurementDate,
            migratedFields: migration.migratedFields,
            skippedLegacyAnswers: migration.skippedLegacyAnswers,
            diagnostics: migration.diagnostics,
            integration,
            supplyAsaPcap,
            sourceCoverage: evaluateProcurementSourceCaseCoverage(),
            uiManifest: evaluateUniversalV1UiFieldManifest(),
            runtimeAssets: evaluateFerreteriaV1RuntimeAssetReadiness(),
          });
          return;
        }
        if (request.method === "POST" && parts[3] === "answers") { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const updated = orchestrator.answer(id, String(body.questionId) as IntakeQuestionId, body.value, actor.id); sendJson(response, 200, { caseValue: updated, progress: orchestrator.progress(id) }); return; }
        if (request.method === "POST" && parts[3] === "event-services") { const actor = requireRole(request, "OPERATOR"); const body = await readJson(request); const updated = orchestrator.configureEventServices(id, eventFeatures(body.features), eventAnswers(body.answers), actor.id); let review; try { review = orchestrator.review(id); } catch { review = undefined; } sendJson(response, 200, { caseValue: updated, review, eventConfigured: true }); return; }
        if (request.method === "POST" && parts[3] === "pre-legal-review") { const actor = requireRole(request, "REVIEWER"); const body = await readJson(request); const updated = orchestrator.configurePreLegalReview(id, body as unknown as PreLegalReviewInput, actor.id); let review; try { review = orchestrator.review(id); } catch { review = undefined; } sendJson(response, 200, { caseValue: updated, review, preLegalConfigured: true }); return; }
        if (request.method === "GET" && parts[3] === "questionnaire") { requireRole(request, "OPERATOR"); const file = orchestrator.questionnaire(id); sendBinary(response, 200, file.data, file.mimeType, file.fileName); return; }
        if (request.method === "GET" && parts[3] === "review") { requireRole(request, "VIEWER"); sendJson(response, 200, orchestrator.review(id)); return; }
        if (request.method === "POST" && parts[3] === "validate") { const actor = requireRole(request, "REVIEWER"); const body = await readJson(request); const validatedBy = String(body.validatedBy ?? actor.id).trim() || actor.id; sendJson(response, 200, orchestrator.validate(id, validatedBy)); return; }
        if (request.method === "POST" && parts[3] === "generate") { const actor = requireRole(request, "OPERATOR"); const rendered = orchestrator.generate(id, actor.id); sendJson(response, 200, { manifest: { expedienteId: id, legacyPipeline: true, productionEligible: false, replacement: `/api/cases/${encodeURIComponent(id)}/universal-readiness`, validation: rendered.package.globalValidation, coherenceFingerprint: rendered.package.coherenceFingerprint, preLegal: (() => { try { return orchestrator.review(id).lb7; } catch { return undefined; } })() }, documents: [...rendered.editable, ...rendered.pdf].map(file => ({ documentId: file.documentId, fileName: file.fileName, mimeType: file.mimeType, base64: Buffer.from(file.data).toString("base64") })) }); return; }
      }
      sendJson(response, 404, { error: "Ruta no encontrada." });
    } catch (error) { const value = error instanceof Error ? error : new Error(String(error)); sendJson(response, statusForError(value), { error: value.message }); }
  });
}
export async function startLB6Server(port = Number(process.env.PORT ?? 3000)): Promise<http.Server> { const server = createLB6Server(); await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", () => resolve()); }); return server; }
