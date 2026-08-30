export const LB102_PILOT_ACCEPTANCE_UI = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contrata-IA · Piloto LB102</title>
<style>
body{font-family:Arial,sans-serif;max-width:1100px;margin:32px auto;padding:0 16px;color:#202124}
h1{margin-bottom:6px}.muted{color:#666}.card{border:1px solid #ddd;border-radius:10px;padding:18px;margin:16px 0}
.packages{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pkg{border:1px solid #ddd;border-radius:10px;padding:15px}
label{display:block;font-weight:600;margin:10px 0 4px}input,textarea,button{font:inherit;padding:10px;box-sizing:border-box}
input,textarea{width:100%}textarea{min-height:70px}button{cursor:pointer;margin:8px 6px 0 0}.ok{color:#137333}.bad{color:#b3261e}
pre{white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:8px}.sha{font-family:monospace;word-break:break-all;font-size:12px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.login-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.hidden{display:none}
@media(max-width:760px){.packages,.row{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>Contrata-IA · aceptación funcional LB102</h1>
<p class="muted">Prepiloto técnico acreditado. Cada revisión queda ligada al ZIP generado por el servidor. La aceptación del piloto no implica producción institucional.</p>
<section class="card">
<h2>1. Acceso</h2>
<div class="row">
<div><label for="username">Usuario</label><input id="username" autocomplete="username" placeholder="usuario-piloto-1"></div>
<div><label for="password">Contraseña</label><input id="password" type="password" autocomplete="current-password"></div>
</div>
<div class="login-actions"><button id="loginButton" type="button">Entrar</button><button id="logoutButton" type="button">Salir</button><span class="muted">La sesión se recuerda durante 7 días en este navegador.</span></div>
<p id="me" class="muted">No autenticado.</p>
</section>
<section class="card" id="sessionCard">
<h2>2. Sesión de aceptación</h2>
<button id="sessionButton" type="button">Registrar esta sesión</button>
<button id="statusButton" type="button">Actualizar estado</button>
<pre id="status">Sin consultar.</pre>
</section>
<section class="card" id="sourcesCard">
<h2>2.A. Fuentes físicas Ferretería</h2>
<p class="muted">Solo ADMIN. Carga única de los ODT fuente exactos del expediente CONTR/2026/240267. El servidor comprueba SHA-256 y huella de estilo antes de persistirlos.</p>
<div class="row">
<div>
<label for="memorySource">Memoria V12 letrado (.odt)</label>
<input id="memorySource" type="file" accept=".odt,application/vnd.oasis.opendocument.text">
<button id="uploadMemoryButton" type="button">Validar y guardar Memoria</button>
</div>
<div>
<label for="pptSource">PPT V6 (.odt)</label>
<input id="pptSource" type="file" accept=".odt,application/vnd.oasis.opendocument.text">
<button id="uploadPptButton" type="button">Validar y guardar PPT</button>
</div>
</div>
<button id="sourceStatusButton" type="button">Comprobar fuentes Ferretería</button>
<pre id="sourceStatus">Sin comprobar.</pre>
</section>
<section class="card">
<h2>3. Cuatro expedientes reales</h2>
<p class="muted">Descarga y abre cada ZIP. Revisa Memoria, PCAP y PPT. Solo después registra el resultado. El SHA no se introduce manualmente: Contrata-IA lo calcula al generar el paquete.</p>
<div id="packages" class="packages"></div>
</section>
<section class="card" id="decisionCard">
<h2>4. Decisión final</h2>
<p class="muted">Solo ADMIN. Deben existir 2 sesiones, 2 usuarios distintos, 4 paquetes revisados y 0 defectos críticos abiertos.</p>
<label for="rationale">Motivación</label>
<textarea id="rationale" placeholder="Motivación de la aceptación o rechazo funcional"></textarea>
<button id="acceptDecisionButton" type="button">Aceptar piloto</button>
<button id="rejectDecisionButton" type="button">Rechazar / mantener abierto</button>
<pre id="decisionResult"></pre>
</section>
<script>
async function requestJson(url, options) {
  const config = options || {};
  const response = await fetch(url, { credentials: "same-origin", headers: { "content-type": "application/json", ...(config.headers || {}) }, ...config });
  const text = await response.text(); let value;
  try { value = JSON.parse(text); } catch { value = { raw: text }; }
  if (!response.ok) { const blockers = Array.isArray(value.blockers) ? value.blockers.join(" · ") : ""; throw new Error(value.error || blockers || JSON.stringify(value)); }
  return value;
}
function setText(id, text, className) { const element = document.getElementById(id); if (!element) return; element.textContent = text; if (className) element.className = className; }
function applyRole(role) { document.getElementById("sourcesCard").classList.toggle("hidden", role !== "ADMIN"); document.getElementById("decisionCard").classList.toggle("hidden", role !== "ADMIN"); }
function showActor(actor) { setText("me", "Autenticado: " + (actor.displayName || actor.id) + " · " + actor.role, "ok"); applyRole(actor.role); }
async function login() {
  try {
    const usernameInput = document.getElementById("username"); const passwordInput = document.getElementById("password");
    const username = usernameInput.value.trim(); const password = passwordInput.value;
    if (!username || !password) throw new Error("Introduce usuario y contraseña.");
    const loginEnvelope = "LOGIN\u0000" + username + "\u0000" + password;
    const value = await requestJson("/api/lb102/session/login", { method: "POST", body: JSON.stringify({ token: loginEnvelope }) });
    passwordInput.value = ""; showActor(value.actor); await loadPackages(); await refreshStatus(); if (value.actor.role === "ADMIN") await refreshSourceStatus();
  } catch (error) { setText("me", "Error: " + error.message, "bad"); }
}
async function logout() {
  try { await requestJson("/api/lb102/session/logout", { method: "POST", body: "{}" }); setText("me", "No autenticado.", "muted"); document.getElementById("password").value=""; document.getElementById("packages").replaceChildren(); applyRole("VIEWER"); }
  catch (error) { setText("me", "Error: " + error.message, "bad"); }
}
async function recordSession() { try { await requestJson("/api/lb102/acceptance/sessions", { method: "POST", body: "{}" }); await refreshStatus(); } catch (error) { setText("status", "Error: " + error.message, "bad"); } }
async function refreshStatus() { try { const value = await requestJson("/api/lb102/acceptance/status"); setText("status", JSON.stringify(value, null, 2)); } catch (error) { setText("status", "Error: " + error.message, "bad"); } }
async function uploadSource(kind, inputId) {
  const input = document.getElementById(inputId); const file = input.files && input.files[0]; if (!file) { setText("sourceStatus", "Selecciona primero el archivo ODT.", "bad"); return; }
  try {
    setText("sourceStatus", "Validando " + file.name + "...", "muted");
    const response = await fetch("/api/lb102/ferreteria-sources/" + kind, { method: "PUT", credentials: "same-origin", headers: { "content-type": "application/vnd.oasis.opendocument.text" }, body: file });
    const text = await response.text(); let value; try { value = JSON.parse(text); } catch { value = { raw: text }; }
    if (!response.ok) throw new Error(value.error || JSON.stringify(value));
    setText("sourceStatus", "Guardado " + value.kind + " · SHA-256 " + value.sha256, "ok"); input.value = ""; await refreshSourceStatus();
  } catch (error) { setText("sourceStatus", "Error: " + error.message, "bad"); }
}
async function refreshSourceStatus() {
  try { const value = await requestJson("/api/lb102/ferreteria-sources"); const lines = value.assets.map(function (x) { return (x.available ? "OK " : "FALTA ") + x.kind + " · " + x.templateId + (x.sha256 ? " · " + x.sha256 : ""); }); setText("sourceStatus", (value.ready ? "Fuentes protegidas listas.\n" : "Fuentes protegidas incompletas.\n") + lines.join("\n"), value.ready ? "ok" : "bad"); }
  catch (error) { setText("sourceStatus", "Error: " + error.message, "bad"); }
}
function field(tag, text) { const element = document.createElement(tag); element.textContent = text; return element; }
function createPackageCard(pkg) {
  const article = document.createElement("article"); article.className = "pkg"; article.id = "pkg-" + pkg.id;
  article.appendChild(field("h3", pkg.label)); article.appendChild(field("p", "Expediente: " + pkg.caseId + " · Familia: " + pkg.family + " · Perfil: " + pkg.profile));
  const download = field("button", "Generar y descargar ZIP"); download.type = "button"; article.appendChild(download);
  const sha = field("p", "SHA pendiente de generación."); sha.className = "sha muted"; article.appendChild(sha);
  const acceptedLabel = document.createElement("label"); const accepted = document.createElement("input"); accepted.type = "checkbox"; accepted.checked = true; accepted.style.width = "auto"; acceptedLabel.appendChild(accepted); acceptedLabel.appendChild(document.createTextNode(" Documentación aceptable para piloto")); article.appendChild(acceptedLabel);
  const criticalLabel = field("label", "Defectos críticos abiertos"); const critical = document.createElement("input"); critical.type = "number"; critical.min = "0"; critical.value = "0"; article.appendChild(criticalLabel); article.appendChild(critical);
  const notesLabel = field("label", "Observaciones de revisión"); const notes = document.createElement("textarea"); article.appendChild(notesLabel); article.appendChild(notes);
  const review = field("button", "Registrar revisión de este paquete"); review.type = "button"; article.appendChild(review); const result = document.createElement("pre"); article.appendChild(result);
  download.addEventListener("click", async function () {
    try { sha.textContent = "Generando paquete..."; sha.className = "sha muted"; const response = await fetch("/api/lb102/pilot-packages/" + encodeURIComponent(pkg.id) + "/download", { credentials: "same-origin" }); if (!response.ok) { const value = await response.json(); throw new Error((value.blockers || []).join(" · ") || value.error || "No se pudo generar el paquete"); } const hash = response.headers.get("x-contrata-ia-package-sha256") || "SHA no disponible"; const blob = await response.blob(); const disposition = response.headers.get("content-disposition") || ""; const match = /filename="([^"]+)"/.exec(disposition); const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(blob); anchor.download = match ? match[1] : pkg.id + ".zip"; document.body.appendChild(anchor); anchor.click(); const href = anchor.href; anchor.remove(); setTimeout(function () { URL.revokeObjectURL(href); }, 1000); sha.textContent = "SHA-256 generado por servidor: " + hash; sha.className = "sha ok"; }
    catch (error) { sha.textContent = "Error: " + error.message; sha.className = "sha bad"; }
  });
  review.addEventListener("click", async function () {
    try { const body = { accepted: accepted.checked, criticalDefectsOpen: Number(critical.value || 0), notes: notes.value }; const value = await requestJson("/api/lb102/pilot-packages/" + encodeURIComponent(pkg.id) + "/review", { method: "POST", body: JSON.stringify(body) }); result.textContent = "Revisión registrada. SHA servidor: " + value.package.sha256; result.className = "ok"; sha.textContent = "SHA-256 registrado: " + value.package.sha256; sha.className = "sha ok"; await refreshStatus(); }
    catch (error) { result.textContent = "Error: " + error.message; result.className = "bad"; }
  });
  return article;
}
async function loadPackages() { const container = document.getElementById("packages"); container.replaceChildren(); try { const value = await requestJson("/api/lb102/pilot-packages"); for (const pkg of value.packages) container.appendChild(createPackageCard(pkg)); } catch (error) { const paragraph = field("p", "Error: " + error.message); paragraph.className = "bad"; container.appendChild(paragraph); } }
async function decision(accepted) { try { const rationale = document.getElementById("rationale").value; const value = await requestJson("/api/lb102/acceptance/decision", { method: "POST", body: JSON.stringify({ accepted, rationale }) }); setText("decisionResult", JSON.stringify(value, null, 2)); await refreshStatus(); } catch (error) { setText("decisionResult", "Error: " + error.message, "bad"); } }
document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("password").addEventListener("keydown", function(event){ if(event.key === "Enter") login(); });
document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("sessionButton").addEventListener("click", recordSession);
document.getElementById("statusButton").addEventListener("click", refreshStatus);
document.getElementById("uploadMemoryButton").addEventListener("click", function () { uploadSource("memoria", "memorySource"); });
document.getElementById("uploadPptButton").addEventListener("click", function () { uploadSource("ppt", "pptSource"); });
document.getElementById("sourceStatusButton").addEventListener("click", refreshSourceStatus);
document.getElementById("acceptDecisionButton").addEventListener("click", function () { decision(true); });
document.getElementById("rejectDecisionButton").addEventListener("click", function () { decision(false); });
applyRole("VIEWER");
(async function bootstrap() { try { const value = await requestJson("/api/lb102/session/me"); showActor(value.actor); await loadPackages(); await refreshStatus(); if(value.actor.role === "ADMIN") await refreshSourceStatus(); } catch {} })();
</script>
</body>
</html>`;
