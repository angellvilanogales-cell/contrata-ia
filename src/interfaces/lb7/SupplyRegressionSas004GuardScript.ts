import { SAS470_REGRESSION_BASELINE, SAS470_REGRESSION_VERSION } from "../../regression/SupplyRegressionCase004Sas470Guard";
import { SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT } from "./SupplyRegressionTablets005ExtractionScript";

const BASELINE_JSON = JSON.stringify(SAS470_REGRESSION_BASELINE);

const SUPPLY_REGRESSION_SAS_004_GUARD_BASE_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION=${JSON.stringify(SAS470_REGRESSION_VERSION)};
var BASELINE=${BASELINE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"sas-regression-11.7.7"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function manifest(){return {version:VERSION,caseId:BASELINE.caseId,status:BASELINE.passed?"AUTOMATIC_REGRESSION_ACTIVE":"AUTOMATIC_REGRESSION_BLOCKED",passed:BASELINE.passed,blockers:BASELINE.blockers,checks:BASELINE.checks,protectedScope:BASELINE.protectedScope,deliberatelyNotFrozenYet:BASELINE.deliberatelyNotFrozenYet,requiresSourceExtractionHumanValidation:true,sourceExtractionHumanValidated:true,acceptanceRule:"La regresión protege únicamente el alcance validado en 11.7.6: acuerdo marco, procedimiento abierto, lotes, tracto sucesivo, precios unitarios, criterios múltiples, juicio de valor, criterios automáticos y existencia de modificación prevista. Los detalles finos siguen pendientes de extracción específica.",registeredAt:new Date().toISOString()};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SUPPLY-004_SAS470_Regression_11-7-7.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function rows(){return BASELINE.checks.map(function(c){return '<tr><td>'+esc(c.id)+'</td><td>'+(c.ok?'✓ Pasa':'✗ Bloquea')+'</td><td>'+esc(c.purpose)+'</td></tr>';}).join("");}
function card(){var a=readAnswers();if(a.supplyRegressionSas004ExtractionValidated!==true)return "";var registered=a.supplyRegressionSas004AutomaticGuardRegistered===true;var html='<div id="supplyRegressionSas004GuardCard" class="card" style="margin-top:14px"><h3>11.7.7 Regresión automática SAS 470/2025</h3>';
if(BASELINE.passed){html+='<div class="info"><strong>Protección automática activa.</strong> La línea base supera '+BASELINE.checks.length+' comprobaciones con 0 bloqueantes. Se protege la naturaleza de acuerdo marco, el procedimiento abierto, los lotes, el tracto sucesivo, los precios unitarios y la coexistencia de juicio de valor y criterios automáticos.</div>';}else{html+='<div class="warning"><strong>Regresión bloqueada.</strong> Existen '+BASELINE.blockers.length+' incoherencias y no puede registrarse.</div>';}
html+='<div class="warning"><strong>Alcance limitado deliberadamente.</strong> No se congelan todavía número/descripción de lotes, importes, CPV, duración/prórrogas, porcentaje o causa concreta de modificación, ponderaciones, fórmulas, adjudicatarios máximos, contratos basados, garantías ni condiciones especiales.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Check</th><th>Resultado</th><th>Qué protege</th></tr></thead><tbody>'+rows()+'</tbody></table>';
if(!registered&&BASELINE.passed){html+='<button id="registerSas004AutomaticGuard" type="button">Registrar regresión automática 11.7.7</button>';}else if(registered){html+='<div class="info"><strong>11.7.7 registrado.</strong> Versión '+esc(VERSION)+'. SAS 470/2025 queda protegido como caso de regresión, pero no como golden case.</div><button id="downloadSas004AutomaticGuard" type="button" class="secondary">Descargar manifiesto 11.7.7 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("supplyRegressionSas004GuardCard");if(old)old.remove();var anchor=document.getElementById("supplyRegressionSas004ExtractionCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="registerSas004AutomaticGuard"){var a=readAnswers();if(a.supplyRegressionSas004ExtractionValidated!==true){alert("Primero debe validarse la extracción documental 11.7.6.");return;}if(!BASELINE.passed){alert("La regresión presenta bloqueantes y no puede registrarse.");return;}var m=manifest();a.supplyRegressionSas004AutomaticGuardRegistered=true;a.supplyRegressionSas004AutomaticGuardVersion=VERSION;a.supplyRegressionSas004AutomaticGuardManifest=m;a.supplyRegressionSas004Status="AUTOMATIC_REGRESSION_ACTIVE";a.supplyRegressionNextRecommendedCase="REG-SUPPLY-005";save(a);downloadJson(m);ensure();alert("Regresión automática SAS 470/2025 11.7.7 registrada. REG-SUPPLY-004 queda protegido sin convertirse en golden case.");return;}if(e.target.id==="downloadSas004AutomaticGuard"){var a2=readAnswers();downloadJson(a2.supplyRegressionSas004AutomaticGuardManifest||manifest());return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;

export const SUPPLY_REGRESSION_SAS_004_GUARD_SCRIPT = SUPPLY_REGRESSION_SAS_004_GUARD_BASE_SCRIPT + "\n" + SUPPLY_REGRESSION_TABLETS_005_EXTRACTION_SCRIPT;
