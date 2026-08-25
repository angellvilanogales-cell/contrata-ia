import { SERVICE_REGRESSION_CASE_005_CARL_FINE } from "../../regression/ServiceRegressionCase005CarlFineExtraction";
import { SERVICE_REGRESSION_CARL_005_FINE_GUARD_SCRIPT } from "./ServiceRegressionCarl005FineGuardScript";

const CASE_JSON = JSON.stringify(SERVICE_REGRESSION_CASE_005_CARL_FINE);

const CARL_FINE_EXTRACTION_CORE_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SERVICE-005-CARL-FINE-EXTRACTION-11.8.2-v1";
var CASE=${CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"carl-service-fine-extraction-11.8.2"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function money(v){return Number(v).toLocaleString("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";}
function manifest(validated){return {version:VERSION,id:CASE.id,step:CASE.step,expediente:CASE.expediente,status:validated?"FINE_SOURCE_EXTRACTION_HUMAN_VALIDATED":"FINE_SOURCE_EXTRACTION_PENDING_HUMAN_VALIDATION",facts:CASE.facts,sourceBoundaries:CASE.sourceBoundaries,correctionToStep118:CASE.correctionToStep118,humanValidationRequired:true,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SERVICE-005_CARL_Fine_11-8-2.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,evidence){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(evidence)+'</td></tr>';}
function card(){var a=readAnswers();if(a.serviceRegressionCarl005AutomaticGuardRegistered!==true)return "";var f=CASE.facts,validated=a.serviceRegressionCarl005FineExtractionValidated===true;var html='<div id="serviceRegressionCarl005FineExtractionCard" class="card" style="margin-top:14px"><h3>11.8.2 Extracción documental fina · CARL limpieza</h3><div class="info"><strong>Corrección documental importante.</strong> La Memoria califica expresamente el expediente como <strong>contrato mixto de servicios y suministros</strong>: 90 % corresponde a servicios y 10 % a suministros accesorios. La prestación principal sigue siendo el servicio de limpieza.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Dato</th><th>Valor extraído</th><th>Alcance</th></tr></thead><tbody>';
html+=row("Calificación","Mixto servicios+suministros; principal servicios","Memoria: 90 % servicios / 10 % suministros");
html+=row("Lotes","No","Único edificio y prestaciones interrelacionadas");
html+=row("Procedimiento","Abierto simplificado · ordinaria","Memoria y PCAP");
html+=row("SARA","No","VE inferior al umbral aplicado en la Memoria");
html+=row("Duración","12 meses + prórroga máxima 12 meses","Inicio previsto 1/1/2025 o formalización posterior");
html+=row("PBL sin IVA",money(f.pblExVat),"Memoria");
html+=row("IVA 21 %",money(f.vatAmount),"Memoria");
html+=row("PBL con IVA",money(f.pblIncVat),"Memoria");
html+=row("Valor estimado",money(f.estimatedValueExVat),"Dato declarado por la fuente; incluye prórroga y modificación prevista del 20 %");
html+=row("Criterios","100 puntos · solo fórmulas","Oferta económica: máximo 80 puntos");
html+=row("Pago","Mensualidades naturales vencidas","Memoria");
html+=row("Coste laboral ref. 2025",money(f.laborCostReference2025),"Subrogación y costes salariales");
html+=row("Costes directos",money(f.directCosts),"Memoria");
html+=row("Costes indirectos",money(f.indirectCosts),"Memoria");
html+='</tbody></table><div class="warning"><strong>No se congela todavía:</strong> detalle de los 20 puntos restantes, fórmulas exactas, literalidad del sistema de precio, solvencia, garantías, condiciones especiales, penalidades, causa exacta de la modificación, detalle completo de subrogación ni DA 33.ª. Esos extremos requieren evidencia expresa adicional del Anexo I.</div>';
if(!validated){html+='<p><strong>Estado:</strong> extracción fina pendiente de validación humana.</p><button id="validateCarl005FineExtraction" type="button">Validar extracción documental 11.8.2</button>';}else{html+='<div class="info"><strong>11.8.2 validado por la persona usuaria.</strong> La línea base CARL queda enriquecida y preparada para una regresión documental de segundo nivel, sin convertirse en golden case.</div><button id="downloadCarl005FineExtraction" type="button" class="secondary">Descargar extracción 11.8.2 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("serviceRegressionCarl005FineExtractionCard");if(old)old.remove();var anchor=document.getElementById("serviceRegressionCarl005GuardCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateCarl005FineExtraction"){var a=readAnswers();if(a.serviceRegressionCarl005AutomaticGuardRegistered!==true){alert("Primero debe estar registrada la regresión CARL 11.8.1.");return;}var m=manifest(true);a.serviceRegressionCarl005FineExtractionValidated=true;a.serviceRegressionCarl005FineExtractionVersion=VERSION;a.serviceRegressionCarl005FineExtractionManifest=m;a.serviceRegressionCarl005FineStatus="FINE_SOURCE_EXTRACTION_HUMAN_VALIDATED";a.serviceRegressionNextRecommendedStep="11.8.3";save(a);downloadJson(m);ensure();alert("Extracción fina CARL 11.8.2 validada. El caso queda listo para regresión documental de segundo nivel.");return;}if(e.target.id==="downloadCarl005FineExtraction"){var a2=readAnswers();downloadJson(a2.serviceRegressionCarl005FineExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;

export const SERVICE_REGRESSION_CARL_005_FINE_EXTRACTION_SCRIPT = CARL_FINE_EXTRACTION_CORE_SCRIPT + "\n" + SERVICE_REGRESSION_CARL_005_FINE_GUARD_SCRIPT;
