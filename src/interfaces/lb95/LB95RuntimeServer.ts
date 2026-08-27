import http, { type ServerResponse } from "node:http";
import path from "node:path";
import { UniversalEvidenceWorkspace } from "../../application/intake/lb52/UniversalEvidenceWorkspace";
import { createHttpPersistedTemplateAssetStoreFromEnv } from "../../application/intake/lb94/HttpPersistedTemplateAssetStore";
import { evaluateSupplyPcapParametrizationGate } from "../../application/intake/lb95/SupplyPcapParametrizationGate";
import { generateSupplyUserDocumentPackage } from "../../application/intake/lb95/SupplyUserDocumentPackageGenerator";
import { evaluateSupplyUserJourney } from "../../application/intake/lb95/SupplyUserJourneyCoordinator";
import { DurableUniversalEvidenceWorkspace } from "../../application/universal/DurableUniversalEvidenceWorkspace";
import { createUniversalCaseMirrorFromEnv } from "../../application/universal/HttpUniversalCaseMirror";
import { UniversalDurableCaseStore } from "../../application/universal/UniversalDurableCaseStore";
import { createLB94RuntimeServer } from "../lb94/LB94RuntimeServer";
import { SecurityPolicy } from "../lb7/SecurityPolicy";
import { SUPPLY_USER_JOURNEY_UI } from "./SupplyUserJourneyUi";

const DATA_ROOT = path.resolve(process.env.CONTRATA_IA_DATA_DIR ?? "var/contrata-ia");
const EVIDENCE_ROOT = path.join(DATA_ROOT, "universal-evidence-v1");
const PCAP_TEMPLATE_ID = "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17";
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
function sendHtml(response: ServerResponse, html: string): void {
  const body = Buffer.from(html);
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "content-length": body.length, "cache-control": "no-store" });
  response.end(body);
}
function sendBinary(response: ServerResponse, data: Uint8Array, fileName: string, mediaType: string): void {
  const body = Buffer.from(data);
  response.writeHead(200, { "content-type": mediaType, "content-length": body.length, "content-disposition": `attachment; filename="${fileName}"`, "cache-control": "no-store" });
  response.end(body);
}
function statusFor(error: Error): number {
  if (/autenticación|credencial|sesión segura/i.test(error.message)) return 401;
  if (/permiso insuficiente/i.test(error.message)) return 403;
  if (/no encontrad/i.test(error.message)) return 404;
  return 400;
}

/** LB95 añade el recorrido Supply sobre LB94 sin duplicar expediente, persistencia ni activos. */
export function createLB95RuntimeServer(): http.Server {
  const base = createLB94RuntimeServer();
  return http.createServer(async (request, response) => {
    security.applySecurityHeaders(response);
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      const parts = url.pathname.split("/").filter(Boolean);
      if (request.method === "GET" && (url.pathname === "/supply" || url.pathname === "/supply/")) { sendHtml(response, SUPPLY_USER_JOURNEY_UI); return; }

      if (parts[0] === "api" && parts[1] === "lb95" && parts[2] === "cases" && parts[3]) {
        const caseId = decodeURIComponent(parts[3]);
        if (request.method === "GET" && parts[4] === "journey" && parts.length === 5) {
          const actor = security.authenticate(request); security.require(actor, "VIEWER");
          const restored = await durableEvidence.get(caseId);
          const store = createHttpPersistedTemplateAssetStoreFromEnv();
          const physical = store ? await store.readiness() : { ready: false, blockers: ["Persistencia externa de plantillas no configurada."], assets: [] };
          const journey = evaluateSupplyUserJourney(restored.record, physical.ready);
          const officialPcapAvailable = physical.assets.some(asset => asset.templateId === PCAP_TEMPLATE_ID && asset.available === true);
          const pcapGate = evaluateSupplyPcapParametrizationGate(restored.record, journey, officialPcapAvailable);
          const currentStageIndex = Math.max(0, journey.stages.findIndex(stage => stage.id === journey.currentStage));
          const journeyForUi = {
            ...journey,
            currentStageIndex,
            currentStageLabel: journey.stages[currentStageIndex]?.label ?? journey.currentStage,
            stages: journey.stages.map(stage => ({ ...stage, requiredFields: stage.applicablePaths, optionalFields: [] as string[] })),
          };
          sendJson(response, 200, { journey: journeyForUi, persistence: restored.persistence.status, physicalPackage: physical, pcapParametrization: pcapGate, sourceAuthority: "00_GUIA_MAESTRA_SUPPLY_LB94", humanValidationRequired: true });
          return;
        }
        if (request.method === "POST" && parts[4] === "generate-package" && parts.length === 5) {
          const actor = security.authenticate(request); security.require(actor, "OPERATOR");
          const restored = await durableEvidence.get(caseId);
          const store = createHttpPersistedTemplateAssetStoreFromEnv();
          if (!store) { sendJson(response, 503, { ready: false, blockers: ["Persistencia externa de plantillas no configurada."] }); return; }
          const physical = await store.readiness();
          const journey = evaluateSupplyUserJourney(restored.record, physical.ready);
          const officialPcapAvailable = physical.assets.some(asset => asset.templateId === PCAP_TEMPLATE_ID && asset.available === true);
          const pcapGate = evaluateSupplyPcapParametrizationGate(restored.record, journey, officialPcapAvailable);
          if (!journey.readyForDocuments || !pcapGate.ready) { sendJson(response, 409, { ready: false, blockers: [...journey.blockers, ...pcapGate.blockers], journey, pcapParametrization: pcapGate }); return; }
          const pkg = await generateSupplyUserDocumentPackage({ record: restored.record, templateStore: store });
          if (!pkg.ready || !pkg.bytes || !pkg.fileName) { sendJson(response, 409, pkg); return; }
          sendBinary(response, pkg.bytes, pkg.fileName, pkg.mediaType);
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
