import fs from "node:fs";
import path from "node:path";

const baseUrl = String(process.argv[2] ?? "").replace(/\/$/, "");
const token = String(process.argv[3] ?? "");
const caseId = String(process.argv[4] ?? "");
if (!/^https:\/\//i.test(baseUrl)) throw new Error("Uso: node scripts/v1-pilot-preflight.mjs https://HOST TOKEN [CASE_ID]");
if (!token) throw new Error("Falta la credencial de piloto.");
const headers = { authorization: `Bearer ${token}` };

async function json(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}: ${body.error ?? JSON.stringify(body)}`);
  return body;
}

const report = { baseUrl, checkedAt: new Date().toISOString(), health: null, runtimeAssets: null, productionReadiness: null, generatedPackage: null };
report.health = await json(`${baseUrl}/api/health`);
report.runtimeAssets = await json(`${baseUrl}/api/runtime-assets/readiness`);
if (!report.runtimeAssets?.verifiedPackage?.ready) {
  console.log(JSON.stringify({ ...report, ready: false, blocker: "RUNTIME_ASSETS_NOT_READY" }, null, 2));
  process.exitCode = 2;
} else if (caseId) {
  report.productionReadiness = await json(`${baseUrl}/api/universal/cases/${encodeURIComponent(caseId)}/production-readiness`);
  if (!report.productionReadiness?.ready) {
    console.log(JSON.stringify({ ...report, ready: false, blocker: "CASE_NOT_PRODUCTION_READY" }, null, 2));
    process.exitCode = 3;
  } else {
    const response = await fetch(`${baseUrl}/api/universal/cases/${encodeURIComponent(caseId)}/generate`, { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: "{}" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`Generación: HTTP ${response.status}: ${body.error ?? JSON.stringify(body)}`);
    }
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("application/zip")) throw new Error(`Generación: content-type inesperado ${type}.`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const target = path.resolve(`Contrata-IA_${caseId.replaceAll("/", "-")}_pilot.zip`);
    fs.writeFileSync(target, bytes, { mode: 0o600 });
    report.generatedPackage = { target, bytes: bytes.length, contentType: type };
    console.log(JSON.stringify({ ...report, ready: true }, null, 2));
  }
} else {
  console.log(JSON.stringify({ ...report, ready: true, note: "Activos runtime verificados; indique CASE_ID para probar generación protegida." }, null, 2));
}
