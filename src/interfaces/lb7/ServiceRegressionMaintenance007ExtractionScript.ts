import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE } from "../../regression/ServiceRegressionCase007MaintenanceSeville";
import { SERVICE_REGRESSION_MAINTENANCE_007_FINE_EXTRACTION_SCRIPT } from "./ServiceRegressionMaintenance007FineExtractionScript";

const CASE_JSON = JSON.stringify(SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE);

const SERVICE_REGRESSION_MAINTENANCE_007_EXTRACTION_CORE_SCRIPT = `"use strict";
(function(){
var work=document.getElementById("work");if(!work)return;
var key="contrataIaAdaptiveAnswers";
var VERSION="REG-SERVICE-007-MAINTENANCE-SEVILLE-EXTRACTION-11.9-v1";
var CASE=${CASE_JSON};
function readJson(s,k){try{return JSON.parse(s.getItem(k)||"{}");}catch(e){return {};}}
function readAnswers(){var a=readJson(sessionStorage,key);if(Object.keys(a).length)return a;return readJson(localStorage,key);}
function save(a){var raw=JSON.stringify(a);sessionStorage.setItem(key,raw);localStorage.setItem(key,raw);document.dispatchEvent(new CustomEvent("contrata-ia:adaptive-saved",{detail:{kind:"maintenance-service-extraction-11.9"}}));}
function esc(v){return String(v==null?"":v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function yes(v){return v?"Sí":"No";}
function manifest(validated){return {version:VERSION,id:CASE.id,step:CASE.step,expediente:CASE.expediente,status:validated?"SOURCE_EXTRACTION_HUMAN_VALIDATED_WITH_SOURCE_INCONSISTENCY":"SOURCE_EXTRACTED_PENDING_HUMAN_VALIDATION",facts:CASE.facts,sourceInconsistencies:CASE.sourceInconsistencies,contrastWithCarl:CASE.contrastWithCarl,deliberatelyNotFrozenYet:CASE.deliberatelyNotFrozenYet,sourceDocuments:CASE.sourceDocuments,humanValidationRequired:true,humanValidated:validated===true,validatedAt:validated?new Date().toISOString():null};}
function downloadJson(data){var blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Contrata-IA_REG-SERVICE-007_Mantenimiento-Sevilla_11-9.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
function row(label,value,contrast){return '<tr><td>'+esc(label)+'</td><td>'+esc(value)+'</td><td>'+esc(contrast)+'</td></tr>';}
function card(){var a=readAnswers();if(a.serviceRegressionCarl005DocumentClosureValidated!==true)return "";var f=CASE.facts,validated=a.serviceRegressionMaintenance007ExtractionValidated===true;var inc=CASE.sourceInconsistencies[0];var html='<div id="serviceRegressionMaintenance007ExtractionCard" class="card" style="margin-top:14px"><h3>11.9 REG-SERVICE-007 · Mantenimiento integral SAE Sevilla</h3><div class="info"><strong>Segundo caso real de servicios.</strong> Se incorpora un servicio técnico multilote y SARA, con Memoria + PCAP + PPT. El objetivo es probar generalización fuera del patrón laboral/económico del CARL.</div><table style="width:100%;border-collapse:collapse"><thead><tr><th>Dato</th><th>Mantenimiento SAE Sevilla</th><th>Contraste CARL</th></tr></thead><tbody>';
html+=row("Tipo","Servicio","IGUAL en tipo principal");
html+=row("Objeto","Mantenimiento integral y gestión técnica de instalaciones","DIFERENTE · CARL limpieza");
html+=row("Procedimiento","Abierto","DIFERENTE · CARL abierto simplificado");
html+=row("SARA",yes(f.sara),"DIFERENTE · CARL no SARA");
html+=row("Lotes","4","DIFERENTE · CARL sin división en lotes");
html+=row("CPV",f.mainAndRelatedCpvs.join(", "),"Pluralidad de especialidades técnicas");
html+=row("Insuficiencia de medios propios",yes(f.insufficientOwnMeansJustified),"Rasgo de servicios confirmado por Memoria");
html+=row("GMAO exigido",yes(f.gmaoRequiredAsTechnicalMeans),"Medio técnico específico del mantenimiento");
html+='</tbody></table><div class="warning"><strong>Inconsistencia detectada en la fuente.</strong> '+esc(inc.statementA)+' / '+esc(inc.statementB)+' <strong>Tratamiento:</strong> '+esc(inc.treatment)+'</div><div class="warning"><strong>Alcance controlado.</strong> No se congelan todavía PBL/VE, duración, prórrogas, sistema de precio, DA 33.ª, modificación, criterios/ponderaciones, juicio de valor, garantías, solvencia económica, subrogación, condiciones especiales ni la regla definitiva de máximo de lotes ofertables.</div>';
if(!validated){html+='<p><strong>Estado:</strong> extracción documental pendiente de validación humana. La inconsistencia de lotes permanece abierta.</p><button id="validateMaintenance007Extraction" type="button">Validar extracción documental 11.9</button>';}else{html+='<div class="info"><strong>11.9 validado por la persona usuaria.</strong> REG-SERVICE-007 queda incorporado como caso real de contraste, manteniendo la inconsistencia de lotes como bloqueo de congelación específica.</div><button id="downloadMaintenance007Extraction" type="button" class="secondary">Descargar extracción 11.9 JSON</button>';}
html+='</div>';return html;}
function ensure(){var old=document.getElementById("serviceRegressionMaintenance007ExtractionCard");if(old)old.remove();var anchor=document.getElementById("serviceRegressionCarl005DocumentClosureCard");if(anchor){var html=card();if(html)anchor.insertAdjacentHTML("afterend",html);}}
document.addEventListener("click",function(e){if(!e.target)return;if(e.target.id==="validateMaintenance007Extraction"){var a=readAnswers();if(a.serviceRegressionCarl005DocumentClosureValidated!==true){alert("Primero debe validarse el cierre documental CARL 11.8.5.");return;}var m=manifest(true);a.serviceRegressionMaintenance007ExtractionValidated=true;a.serviceRegressionMaintenance007ExtractionVersion=VERSION;a.serviceRegressionMaintenance007ExtractionManifest=m;a.serviceRegressionMaintenance007Status="SOURCE_EXTRACTION_HUMAN_VALIDATED_WITH_SOURCE_INCONSISTENCY";a.serviceRegressionNextRecommendedStep="11.9.1";save(a);downloadJson(m);ensure();alert("Extracción 11.9 validada. La contradicción sobre limitación de lotes permanece abierta y no se considera resuelta.");return;}if(e.target.id==="downloadMaintenance007Extraction"){var a2=readAnswers();downloadJson(a2.serviceRegressionMaintenance007ExtractionManifest||manifest(true));return;}},true);
document.addEventListener("contrata-ia:adaptive-saved",function(){setTimeout(ensure,0);});setTimeout(ensure,0);setTimeout(ensure,500);
})();`;

export const SERVICE_REGRESSION_MAINTENANCE_007_EXTRACTION_SCRIPT = SERVICE_REGRESSION_MAINTENANCE_007_EXTRACTION_CORE_SCRIPT + "\n" + SERVICE_REGRESSION_MAINTENANCE_007_FINE_EXTRACTION_SCRIPT;
