import {
  MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT,
  MAINTENANCE_007_ECONOMICS_REGRESSION_VERSION,
} from "../../regression/ServiceRegressionCase007MaintenanceSevilleEconomicsGuard";
import { SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT } from "./ServiceRegressionMaintenance007DocumentClosureScript";

const BASELINE_JSON = JSON.stringify(MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT);

const MAINTENANCE_007_ECONOMICS_GUARD_CORE_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION=${JSON.stringify(MAINTENANCE_007_ECONOMICS_REGRESSION_VERSION)};
var BASELINE=${BASELINE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"maintenance-economics-regression-11.9.4"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function manifest(){return {version:VERSION,caseId:BASELINE.caseId,step:BASELINE.step,sourceStep:BASELINE.sourceStep,status:BASELINE.status,passed:BASELINE.passed,blockers:BASELINE.blockers,checks:BASELINE.checks,protectedEconomicScope:BASELINE.protectedEconomicScope,sourceRoundingGuard:BASELINE.sourceRoundingGuard,deliberatelyStillOpen:BASELINE.deliberatelyStillOpen,promotionRule:BASELINE.promotionRule,registeredAt:new Date().toISOString()};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SERVICE-007_Mantenimiento-Sevilla_Economics-Guard_11-9-4.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function rows(){return BASELINE.checks.map(function(c){return '<tr><td>'+esc(c.id)+'</td><td>'+(c.ok?'✓ Pasa':'✗ Bloquea')+'</td><td>'+esc(c.purpose)+'</td></tr>';}).join("");}
function card(){var a=readAnswers();if(a.serviceRegressionMaintenance007EconomicsValidated!==true)return "";var registered=a.serviceRegressionMaintenance007EconomicsGuardRegistered===true;var html='<div id="serviceRegressionMaintenance007EconomicsGuardCard" class="card" style="margin-top:14px"><h3>11.9.4 Guarda económica automática · Mantenimiento SAE Sevilla</h3>';
html+='<div class="info"><strong>Protección económica activa.</strong> La guarda comprueba '+BASELINE.checks.length+' extremos: importes declarados, cuatro lotes, modificación del 20 %, prórroga de 24 meses, anualidades, aplicación presupuestaria y diferencias de redondeo de fuente.</div>';
html+='<div class="warning"><strong>Regla de redondeo.</strong> Las diferencias de 0,01 € en los lotes 2 y 4 y la diferencia global de 0,02 € se preservan como diagnóstico de la fuente. No se autocorrigen.</div>';
html+='<div class="warning"><strong>Campos todavía abiertos.</strong><ul>'+BASELINE.deliberatelyStillOpen.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>';
html+='<table style="width:100%;border-collapse:collapse"><thead><tr><th>Check</th><th>Resultado</th><th>Qué protege</th></tr></thead><tbody>'+rows()+'</tbody></table>';
if(!registered&&BASELINE.passed){html+='<button id="registerMaintenance007EconomicsGuard" type="button">Registrar guarda económica 11.9.4</button>';}else if(registered){html+='<div class="info"><strong>11.9.4 registrado.</strong> Los valores económicos quedan protegidos como evidencia declarada y los campos jurídicos abiertos siguen sin promoverse.</div><button id="downloadMaintenance007EconomicsGuard" type="button" class="secondary">Descargar manifiesto 11.9.4 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("serviceRegressionMaintenance007EconomicsGuardCard");if(old)old.remove();var anchor=document.getElementById("serviceRegressionMaintenance007EconomicsCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="registerMaintenance007EconomicsGuard"){var a=readAnswers();if(a.serviceRegressionMaintenance007EconomicsValidated!==true){alert("Primero debe validarse la evidencia económica 11.9.3.");return;}if(!BASELINE.passed){alert("La guarda económica presenta bloqueantes internos y no puede registrarse.");return;}var m=manifest();a.serviceRegressionMaintenance007EconomicsGuardRegistered=true;a.serviceRegressionMaintenance007EconomicsGuardVersion=VERSION;a.serviceRegressionMaintenance007EconomicsGuardManifest=m;a.serviceRegressionMaintenance007EconomicsGuardStatus=BASELINE.status;a.serviceRegressionNextRecommendedStep="11.9.5";save(a);downloadJson(m);ensure();alert("Guarda económica 11.9.4 registrada. No se han normalizado redondeos ni cerrado campos jurídicos sin fuente primaria.");return;}if(e.target.id==="downloadMaintenance007EconomicsGuard"){var a2=readAnswers();downloadJson(a2.serviceRegressionMaintenance007EconomicsGuardManifest||manifest());return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;

export const SERVICE_REGRESSION_MAINTENANCE_007_ECONOMICS_GUARD_SCRIPT = MAINTENANCE_007_ECONOMICS_GUARD_CORE_SCRIPT + "\n" + SERVICE_REGRESSION_MAINTENANCE_007_DOCUMENT_CLOSURE_SCRIPT;
