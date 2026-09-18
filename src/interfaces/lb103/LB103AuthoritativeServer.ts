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
import { loadPersistedSupplyGeneralTemplate } from "../../application/intake/lb94/PersistedSupplyGeneralTemplateRuntime";
import { ensurePersistedLb105SupplyTemplates } from "../../application/intake/lb105/LB105SupplyTemplatePromotion";
import {
  auditLb106DecisionMatrix,
  lb106DecisionCards,
  LB106_LEGAL_BASES,
} from "../../domain/decision/lb106/VirginPilotDecisionMatrix";
import { evaluateLB106VirginPilotReadiness } from "../../application/universal/LB106VirginPilotReadiness";
import { LB106_VIRGIN_PILOT_SCRIPT } from "./LB106VirginPilotScript";
import { createInitialProposal } from "../../application/intake/lb107/InitialProposalEngine";
import { LB107_INITIAL_PROPOSAL_SCRIPT } from "./LB107InitialProposalScript";
import { evaluateEconomicStartingPoint, type EconomicStartingPointInput } from "../../application/intake/lb108/EconomicStartingPointEngine";
import { storeValuationDocument } from "../../application/intake/lb108/LB108ValuationEvidenceStore";
import { LB108_ECONOMIC_STARTING_POINT_SCRIPT } from "./LB108EconomicStartingPointScript";
import { evaluateProcedureAndProcessing, type ProcedureAndProcessingInput } from "../../application/intake/lb109/ProcedureAndProcessingEngine";
import { LB109_PROCEDURE_PROCESSING_SCRIPT } from "./LB109ProcedureAndProcessingScript";
import { evaluateCapacityAndSolvency, type CapacityAndSolvencyInput } from "../../application/intake/lb110/CapacityAndSolvencyEngine";
import { LB110_CAPACITY_SOLVENCY_SCRIPT } from "./LB110CapacityAndSolvencyScript";
import { evaluateAwardCriteria, type AwardCriteriaInput } from "../../application/intake/lb111/AwardCriteriaEngine";
import { LB111_AWARD_CRITERIA_SCRIPT } from "./LB111AwardCriteriaScript";
import { evaluateGuarantees, type GuaranteesInput } from "../../application/intake/lb112/GuaranteesEngine";
import { LB112_GUARANTEES_SCRIPT } from "./LB112GuaranteesScript";
import { evaluateSpecialExecutionConditions, type SpecialExecutionInput } from "../../application/intake/lb113/SpecialExecutionConditionsEngine";
import { LB113_SPECIAL_EXECUTION_SCRIPT } from "./LB113SpecialExecutionScript";
import { evaluateSubcontractingAssignment, type SubcontractingAssignmentInput } from "../../application/intake/lb114/SubcontractingAssignmentEngine";
import { LB114_SUBCONTRACTING_ASSIGNMENT_SCRIPT } from "./LB114SubcontractingAssignmentScript";
import { evaluatePlannedModification, type PlannedModificationInput } from "../../application/intake/lb115/PlannedModificationEngine";
import { LB115_PLANNED_MODIFICATION_SCRIPT } from "./LB115PlannedModificationScript";
import { evaluatePriceRevisionDecision, type PriceRevisionDecisionInput } from "../../application/intake/lb116/PriceRevisionDecisionEngine";
import { evaluateExecutionReceiptPayment, type ExecutionReceiptPaymentInput } from "../../application/intake/lb117/ExecutionReceiptPaymentEngine";
import { LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT } from "./LB117ExecutionReceiptPaymentScript";
import { evaluateTechnicalSpecifications, type TechnicalSpecificationsInput } from "../../application/intake/lb118/TechnicalSpecificationsEngine";
import { LB118_TECHNICAL_SPECIFICATIONS_SCRIPT } from "./LB118TechnicalSpecificationsScript";
import { evaluateDataProtectionSecurity, type DataProtectionSecurityInput } from "../../application/intake/lb119/DataProtectionSecurityEngine";
import { LB119_DATA_PROTECTION_SECURITY_SCRIPT } from "./LB119DataProtectionSecurityScript";
import { LB120_DOCUMENT_CONCLUSION_SCRIPT } from "./LB120DocumentConclusionScript";
import { auditLB120PriorDecisionEvidence, createLB120DocumentPreview, createLB120FinalConsent, validateLB120FinalConsent, type LB120ConsentInput } from "../../application/universal/LB120DocumentConclusion";
import { LB116_PRICE_REVISION_SCRIPT } from "./LB116PriceRevisionScript";

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

function lb120CaseId(pathname: string, action: "preview" | "consent"): string | null {
  const match = new RegExp(`^/api/adaptive/cases/([^/]+)/lb120-${action}$`).exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function statusFor(error: Error): number {
  if (/autenticación|credencial|sesión segura/i.test(error.message)) return 401;
  if (/permiso insuficiente/i.test(error.message)) return 403;
  if (/no encontrado/i.test(error.message)) return 404;
  if (/demasiado grande/i.test(error.message)) return 413;
  return 400;
}

function adaptiveUiWithGeneration(): string {
  const tag = '<script src="/lb103-authoritative-generation.js" defer></script><script src="/lb106-virgin-pilot.js" defer></script><script src="/lb107-initial-proposal.js" defer></script><script src="/lb108-economic-starting-point.js" defer></script><script src="/lb109-procedure-processing.js" defer></script><script src="/lb110-capacity-solvency.js" defer></script><script src="/lb111-award-criteria.js" defer></script><script src="/lb112-guarantees.js" defer></script><script src="/lb113-special-execution.js" defer></script><script src="/lb114-subcontracting-assignment.js" defer></script><script src="/lb115-planned-modification.js" defer></script><script src="/lb116-price-revision.js" defer></script><script src="/lb117-execution-receipt-payment.js" defer></script><script src="/lb118-technical-specifications.js" defer></script><script src="/lb119-data-protection-security.js" defer></script><script src="/lb120-document-conclusion.js" defer></script>';
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
      if (request.method === "GET" && url.pathname === "/api/lb106/decision-matrix") {
        const audit = auditLb106DecisionMatrix();
        sendJson(response, audit.ready ? 200 : 503, {
          ready: audit.ready,
          audit,
          decisions: lb106DecisionCards(),
          officialSources: [...new Set(LB106_LEGAL_BASES.map(item => item.officialUrl.split("#")[0]))],
          humanConsentRequired: true,
          productionReady: false,
        });
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/lb106/virgin-pilot") {
        const readiness = evaluateLB106VirginPilotReadiness();
        sendJson(response, readiness.readyForHumanStart ? 200 : 503, readiness);
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb107/initial-proposal") {
        security.require(security.authenticate(request), "VIEWER");
        const body = await readJson(request);
        const description = typeof body.description === "string" ? body.description : "";
        sendJson(response, 200, createInitialProposal(description));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb108/economic-starting-point") {
        security.require(security.authenticate(request), "VIEWER");
        const body = await readJson(request);
        sendJson(response, 200, evaluateEconomicStartingPoint(body as unknown as EconomicStartingPointInput));
        return;
      }
      const valuationUpload = url.pathname.match(/^\/api\/lb108\/cases\/([^/]+)\/valuation-documents$/);
      if (request.method === "PUT" && valuationUpload) {
        security.require(security.authenticate(request), "VIEWER");
        const chunks: Buffer[] = []; let total = 0;
        for await (const chunk of request) { const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); total += bytes.length; if (total > 10_000_000) throw new Error("El documento supera el máximo de 10 MB."); chunks.push(bytes); }
        const fileName = decodeURIComponent(String(request.headers["x-file-name"] ?? "documento"));
        const stored = storeValuationDocument(decodeURIComponent(valuationUpload[1]!), fileName, String(request.headers["content-type"] ?? "application/octet-stream"), Buffer.concat(chunks));
        sendJson(response, 201, stored); return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb109/procedure-processing") {
        security.require(security.authenticate(request), "VIEWER");
        const body = await readJson(request);
        sendJson(response, 200, evaluateProcedureAndProcessing(body as unknown as ProcedureAndProcessingInput));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb110/capacity-solvency") {
        security.require(security.authenticate(request), "VIEWER");
        const body = await readJson(request);
        sendJson(response, 200, evaluateCapacityAndSolvency(body as unknown as CapacityAndSolvencyInput));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb111/award-criteria") {
        security.require(security.authenticate(request), "VIEWER");
        const body = await readJson(request);
        sendJson(response, 200, evaluateAwardCriteria(body as unknown as AwardCriteriaInput));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb112/guarantees") {
        security.require(security.authenticate(request), "VIEWER");
        const body = await readJson(request);
        sendJson(response, 200, evaluateGuarantees(body as unknown as GuaranteesInput));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb113/special-execution") {
        security.require(security.authenticate(request), "VIEWER"); const body=await readJson(request);
        sendJson(response,200,evaluateSpecialExecutionConditions(body as unknown as SpecialExecutionInput)); return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb114/subcontracting-assignment") {
        security.require(security.authenticate(request), "VIEWER"); const body=await readJson(request);
        sendJson(response,200,evaluateSubcontractingAssignment(body as unknown as SubcontractingAssignmentInput)); return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb115/planned-modification") {
        security.require(security.authenticate(request), "VIEWER"); const body=await readJson(request);
        sendJson(response,200,evaluatePlannedModification(body as unknown as PlannedModificationInput)); return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb116/price-revision") {
        security.require(security.authenticate(request), "VIEWER"); const body=await readJson(request);
        sendJson(response,200,evaluatePriceRevisionDecision(body as unknown as PriceRevisionDecisionInput)); return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb117/execution-receipt-payment") {
        security.require(security.authenticate(request), "VIEWER"); const body=await readJson(request);
        sendJson(response,200,evaluateExecutionReceiptPayment(body as unknown as ExecutionReceiptPaymentInput)); return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb118/technical-specifications") {
        security.require(security.authenticate(request), "VIEWER"); const body=await readJson(request);
        sendJson(response,200,evaluateTechnicalSpecifications(body as unknown as TechnicalSpecificationsInput)); return;
      }
      if (request.method === "POST" && url.pathname === "/api/lb119/data-protection-security") { security.require(security.authenticate(request), "VIEWER"); const body=await readJson(request); sendJson(response,200,evaluateDataProtectionSecurity(body as unknown as DataProtectionSecurityInput)); return; }
      if (request.method === "GET" && url.pathname === "/api/lb105/normalized-synthetic-package") {
        const store = createHttpPersistedTemplateAssetStoreFromEnv();
        if (!store) { sendJson(response, 503, {ready:false, synthetic:true, productionReady:false, blockers:["Persistencia de plantillas no configurada."]}); return; }
        const result = await runLB103NewCaseSelfTest(store, { includePackageBytes: true });
        const packageBytes = "packageBytes" in result ? result.packageBytes : undefined;
        const packageFileName = "packageFileName" in result ? result.packageFileName : undefined;
        if (!result.ready || !packageBytes || !packageFileName) {
          sendJson(response, 503, { ...result, packageBytes: undefined });
          return;
        }
        response.setHeader("x-contrata-ia-synthetic", "true");
        response.setHeader("x-contrata-ia-counts-as-human-acceptance", "false");
        sendZip(response, packageBytes, packageFileName);
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/lb105/normalized-template-candidates") {
        const store = createHttpPersistedTemplateAssetStoreFromEnv();
        if (!store) { sendJson(response, 503, {ready:false, synthetic:true, productionReady:false, blockers:["Persistencia de plantillas no configurada."]}); return; }
        const candidates = await Promise.all((["MEMORY", "PPT"] as const).map(async kind => {
          const candidate = await loadPersistedSupplyGeneralTemplate(store, kind);
          if (!candidate.ready) throw new Error(`Candidato LB105 ${kind} bloqueado: ${candidate.blockers.join(" | ")}`);
          return {
            kind: kind === "MEMORY" ? "MEMORIA" : "PPT",
            proposedTemplateId: `contrata-ia:supply:${kind === "MEMORY" ? "memory" : "ppt"}:general:LB105-SUPPLY-CANONICAL-ODT-V1`,
            sha256: candidate.derivedSha256,
            styleFingerprint: candidate.derivedStyleFingerprint,
            structuralStyleFingerprint: candidate.derivedStructuralStyleFingerprint,
            transformationVersion: candidate.transformationVersion,
            byteLength: candidate.bytes.byteLength,
            contentBase64: Buffer.from(candidate.bytes).toString("base64"),
            officialModelClaimed: false,
            humanValidationRequired: true,
          };
        }));
        sendJson(response, 200, {ready:true, candidates, changesPersistence:false, productionReady:false, humanAcceptanceRequired:true});
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
      if (request.method === "GET" && url.pathname === "/lb106-virgin-pilot.js") {
        sendText(response, 200, LB106_VIRGIN_PILOT_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb107-initial-proposal.js") {
        sendText(response, 200, LB107_INITIAL_PROPOSAL_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb108-economic-starting-point.js") {
        sendText(response, 200, LB108_ECONOMIC_STARTING_POINT_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb109-procedure-processing.js") {
        sendText(response, 200, LB109_PROCEDURE_PROCESSING_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb110-capacity-solvency.js") {
        sendText(response, 200, LB110_CAPACITY_SOLVENCY_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb111-award-criteria.js") {
        sendText(response, 200, LB111_AWARD_CRITERIA_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb112-guarantees.js") {
        sendText(response, 200, LB112_GUARANTEES_SCRIPT, "application/javascript; charset=utf-8");
        return;
      }
      if (request.method === "GET" && url.pathname === "/lb113-special-execution.js") { sendText(response,200,LB113_SPECIAL_EXECUTION_SCRIPT,"application/javascript; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/lb114-subcontracting-assignment.js") { sendText(response,200,LB114_SUBCONTRACTING_ASSIGNMENT_SCRIPT,"application/javascript; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/lb115-planned-modification.js") { sendText(response,200,LB115_PLANNED_MODIFICATION_SCRIPT,"application/javascript; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/lb116-price-revision.js") { sendText(response,200,LB116_PRICE_REVISION_SCRIPT,"application/javascript; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/lb117-execution-receipt-payment.js") { sendText(response,200,LB117_EXECUTION_RECEIPT_PAYMENT_SCRIPT,"application/javascript; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/lb118-technical-specifications.js") { sendText(response,200,LB118_TECHNICAL_SPECIFICATIONS_SCRIPT,"application/javascript; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/lb119-data-protection-security.js") { sendText(response,200,LB119_DATA_PROTECTION_SECURITY_SCRIPT,"application/javascript; charset=utf-8"); return; }
      if (request.method === "GET" && url.pathname === "/lb120-document-conclusion.js") { sendText(response,200,LB120_DOCUMENT_CONCLUSION_SCRIPT,"application/javascript; charset=utf-8"); return; }

      const lb120PreviewCaseId = request.method === "POST" ? lb120CaseId(url.pathname, "preview") : null;
      if (lb120PreviewCaseId) {
        const actor = security.authenticate(request); security.require(actor, "OPERATOR");
        const body = await readJson(request);
        const caseValue=caseStore.get(lb120PreviewCaseId); const priorBlockers=auditLB120PriorDecisionEvidence(caseValue.universalEvidence??{});
        if(priorBlockers.length){sendJson(response,409,{error:"D20 exige el cierre validado de D01 a D19.",blockers:priorBlockers,productionReady:false});return;}
        const templateStore = createHttpPersistedTemplateAssetStoreFromEnv();
        if (!templateStore) { sendJson(response,503,{error:"La vista previa exige la persistencia remota acreditada de plantillas.",productionReady:false}); return; }
        const result = await generateLB103AuthoritativeSupplyPackage({caseValue,presentedSeals:{snapshotSha256:typeof body.snapshotSha256==="string"?body.snapshotSha256:"",documentarySelectionSha256:typeof body.documentarySelectionSha256==="string"?body.documentarySelectionSha256:""},templateStore});
        if (!result.ready || !result.package) { sendJson(response,409,{error:"La vista previa D20 ha sido bloqueada.",blockers:result.blockers,productionReady:false}); return; }
        sendJson(response,200,createLB120DocumentPreview(result.preflight,result.package)); return;
      }

      const lb120ConsentCaseId = request.method === "POST" ? lb120CaseId(url.pathname, "consent") : null;
      if (lb120ConsentCaseId) {
        const actor = security.authenticate(request); security.require(actor, "REVIEWER");
        const body = await readJson(request) as unknown as LB120ConsentInput;
        const caseValue=caseStore.get(lb120ConsentCaseId); const priorBlockers=auditLB120PriorDecisionEvidence(caseValue.universalEvidence??{});
        if(priorBlockers.length){sendJson(response,409,{error:"D20 exige el cierre validado de D01 a D19.",blockers:priorBlockers,productionReady:false});return;}
        const templateStore = createHttpPersistedTemplateAssetStoreFromEnv();
        if (!templateStore) { sendJson(response,503,{error:"El consentimiento exige la persistencia remota acreditada de plantillas.",productionReady:false}); return; }
        const result = await generateLB103AuthoritativeSupplyPackage({caseValue,presentedSeals:{snapshotSha256:body.snapshotSha256??"",documentarySelectionSha256:body.documentarySelectionSha256??""},templateStore});
        if (!result.ready || !result.package) { sendJson(response,409,{error:"El consentimiento D20 ha sido bloqueado.",blockers:result.blockers,productionReady:false}); return; }
        const preview=createLB120DocumentPreview(result.preflight,result.package);
        sendJson(response,200,{record:createLB120FinalConsent(preview,body,actor.id),humanValidationRequired:true,productionReady:false}); return;
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
        const preview=createLB120DocumentPreview(result.preflight,result.package);
        const consentBlockers=validateLB120FinalConsent(caseStore.get(generationCaseId).universalEvidence?.["closure.finalConsentRecord"],preview);
        if(consentBlockers.length){sendJson(response,409,{error:"La descarga exige consentimiento final D20 vigente.",blockers:consentBlockers,humanAcceptanceStillRequired:true,productionReady:false});return;}
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
  await ensurePersistedLb105SupplyTemplates();
  const remote = HttpAdaptiveCaseMirror.fromEnvironment();
  if (remote) await remote.hydrate(adaptiveCases);
  const server = createLB103AuthoritativeServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });
  return server;
}
