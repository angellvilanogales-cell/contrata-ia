import { SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE } from "../../regression/ServiceRegressionCase005CarlAnnexIClosure";

const CASE_JSON = JSON.stringify(SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE);

export const SERVICE_REGRESSION_CARL_005_ANNEX_I_CLOSURE_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SERVICE-005-CARL-ANNEX-I-REVIEW-11.8.4-v1";
var CASE=${CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"carl-annex-i-review-11.8.4"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function yes(v){return v?"Sí":"No";}
function manifest(validated){return {version:VERSION,id:CASE.id,step:CASE.step,expediente:CASE.expediente,status:validated?"ANNEX_I_EVIDENCE_REVIEW_HUMAN_VALIDATED":"ANNEX_I_EVIDENCE_REVIEW_PENDING_HUMAN_VALIDATION",confirmedFromSources:CASE.confirmedFromSources,unresolved:CASE.unresolvedBecauseExactAnnexITextNotReliablyRecovered,evidencePolicy:CASE.evidencePolicy,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SERVICE-005_CARL_Annex-I_11-8-4.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,status){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(status)+'</td></tr>';}
function card(){var a=readAnswers();if(a.serviceRegressionCarl005FineGuardRegistered!==true)return "";var c=CASE.confirmedFromSources,validated=a.serviceRegressionCarl005AnnexIReviewValidated===true;var html='<div id="serviceRegressionCarl005AnnexIClosureCard" class="card" style="margin-top:14px"><h3>11.8.4 Revisión controlada del Anexo I · CARL</h3><div class="info"><strong>Regla de evidencia estricta.</strong> Este paso no completa el Anexo I por deducción. Solo cierra lo que puede acreditarse materialmente en las fuentes recuperadas; los umbrales o cláusulas cuyo texto exacto no se ha recuperado permanecen abiertos.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Extremo</th><th>Resultado</th><th>Estado</th></tr></thead><tbody>';
html+=row("Solvencia","Exigida; detalle remitido al Anexo I apartado 4","CONFIRMADO PARCIAL · umbrales no congelados");
html+=row("Modelo de proposición económica",yes(c.economicProposalModelPresent)+" · importe total sin IVA","CONFIRMADO");
html+=row("Criterios","100 puntos mediante fórmulas; precio hasta 80 puntos","CONFIRMADO");
html+=row("Modificación prevista",yes(c.plannedModification)+" · 20 %","CONFIRMADO EN PORCENTAJE · causa literal pendiente");
html+=row("Subrogación de personal",yes(c.personnelSubrogation),"CONFIRMADO");
html+=row("Garantías","No congeladas","PENDIENTE TEXTO EXACTO");
html+=row("Condiciones especiales","No congeladas","PENDIENTE TEXTO EXACTO");
html+=row("Penalidades","No congeladas","PENDIENTE TEXTO EXACTO");
html+=row("DA 33.ª","No congelada","PENDIENTE EVIDENCIA EXPRESA");
html+='</tbody></table><div class="warning"><strong>Campos que siguen abiertos:</strong><ul>'+CASE.unresolvedBecauseExactAnnexITextNotReliablyRecovered.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div><div class="warning"><strong>Por qué no se rellenan:</strong> '+esc(CASE.evidencePolicy.note)+'</div>';
if(!validated){html+='<p><strong>Estado:</strong> revisión de evidencia del Anexo I pendiente de validación humana.</p><button id="validateCarl005AnnexIReview" type="button">Validar revisión de evidencia 11.8.4</button>';}else{html+='<div class="info"><strong>11.8.4 validado por la persona usuaria.</strong> Queda registrado qué extremos están confirmados y cuáles siguen abiertos. No se crea una falsa completitud del Anexo I.</div><button id="downloadCarl005AnnexIReview" type="button" class="secondary">Descargar revisión 11.8.4 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("serviceRegressionCarl005AnnexIClosureCard");if(old)old.remove();var anchor=document.getElementById("serviceRegressionCarl005FineGuardCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateCarl005AnnexIReview"){var a=readAnswers();if(a.serviceRegressionCarl005FineGuardRegistered!==true){alert("Primero debe estar registrada la regresión documental 11.8.3.");return;}var m=manifest(true);a.serviceRegressionCarl005AnnexIReviewValidated=true;a.serviceRegressionCarl005AnnexIReviewVersion=VERSION;a.serviceRegressionCarl005AnnexIReviewManifest=m;a.serviceRegressionCarl005AnnexIReviewStatus="ANNEX_I_EVIDENCE_REVIEW_HUMAN_VALIDATED";a.serviceRegressionNextRecommendedStep="11.8.5";save(a);downloadJson(m);ensure();alert("Revisión de evidencia 11.8.4 validada. Los campos no recuperados siguen abiertos y no se consideran completados.");return;}if(e.target.id==="downloadCarl005AnnexIReview"){var a2=readAnswers();downloadJson(a2.serviceRegressionCarl005AnnexIReviewManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;
